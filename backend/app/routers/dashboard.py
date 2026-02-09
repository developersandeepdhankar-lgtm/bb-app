from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, asc, desc
from datetime import date, timedelta
from app.core.database import get_db
import os
from dotenv import load_dotenv
from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.incentive_rule import IncentiveRule

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

# =====================================================
# ENV
# =====================================================
load_dotenv()
ENV_QUOTATION_DAYS = os.getenv("QUOTATION_LOOKBACK_DAYS")

#===========================================
# Incentive Rules Fetcher       
def calculate_multi_level_incentive(sale: float, db: Session) -> int:
    rules = (
        db.query(IncentiveRule)
        .order_by(asc(IncentiveRule.min_amount))
        .all()
    )

    highest_amt = (
        db.query(IncentiveRule)
        .order_by(desc(IncentiveRule.min_amount))
        .first()
    )

    total_incentive = 0.0
    sale = float(sale)

    for rule in rules:
        min_amt = float(rule.min_amount)
        max_amt = float(rule.max_amount) if rule.max_amount is not None else sale
        incentive_percent = float(rule.incentive_percent)

        slab_start = min_amt
        slab_end = min(max_amt, sale)

        if sale > slab_start:
            slab_amount = max(0.0, slab_end - slab_start)
            incentive = (slab_amount * incentive_percent) / 100
            total_incentive += incentive

        if (
            highest_amt.max_amount in (None, "")
            and sale >= float(highest_amt.min_amount)
        ):
            total_incentive = (sale * incentive_percent) / 100

    return round(total_incentive)

# =====================================================
# NET SALES (GST + CREDIT NOTE + ROLE FILTER)
# =====================================================
def calculate_net_sales(
    db: Session,
    start_date: date,
    end_date: date,
    user_id: int | None,
    role_id: int | None,
) -> float:

   

    sql = text("""
        SELECT
            COALESCE(SUM(
                CASE
                    WHEN v.voucher_type = 'Sales'
                        THEN ABS(vl.amount)
                    WHEN v.voucher_type = 'Credit Note'
                        THEN -ABS(vl.amount)
                    ELSE 0
                END
            ), 0) AS total_sales
        FROM vouchers v
        JOIN voucher_ledgers vl
            ON vl.guid = v.guid
        WHERE
            v.voucher_type IN ('Sales', 'Credit Note')
            AND vl.amount < 0              -- PARTY ledger only
            AND v.voucher_date BETWEEN :start AND :end
            AND (
                :role_id = 1
                OR v.user_id = :user_id
            )
    """)

    result = db.execute(
        sql,
        {
            "start": start_date,
            "end": end_date,
            "user_id": user_id,
            "role_id": role_id,
        }
    ).scalar()

    return round(float(result or 0), 2)

# =====================================================
# PURCHASES
# =====================================================
def calculate_purchases(db: Session, start_date: date, end_date: date) -> float:
    return float(db.execute(
        text("""
            SELECT COALESCE(ABS(SUM(vl.amount)), 0)
            FROM voucher_ledgers vl
            JOIN vouchers v ON v.guid = vl.guid
            WHERE v.voucher_date BETWEEN :start AND :end
              AND (
                vl.ledger_name LIKE '%Purchase GST%'
                OR vl.ledger_name LIKE '%Purchase IGST%'
              )
        """),
        {"start": start_date, "end": end_date}
    ).scalar() or 0)

# =====================================================
# FIFO SALES COST
# =====================================================
def calculate_fifo_sales_cost(db: Session, start_date: date, end_date: date) -> float:
    return float(db.execute(
        text("""
            WITH purchase_layers AS (
                SELECT
                    vsi.stock_item_id,
                    v.voucher_date,
                    ABS(vsi.quantity) qty,
                    ABS(vsi.amount) / NULLIF(ABS(vsi.quantity),0) rate,
                    SUM(ABS(vsi.quantity)) OVER (
                        PARTITION BY vsi.stock_item_id
                        ORDER BY v.voucher_date, vsi.id
                    ) cum_qty,
                    SUM(ABS(vsi.quantity)) OVER (
                        PARTITION BY vsi.stock_item_id
                        ORDER BY v.voucher_date, vsi.id
                    ) - ABS(vsi.quantity) prev_cum_qty
                FROM vouchers v
                JOIN voucher_stock_items vsi ON vsi.voucher_guid = v.guid
                WHERE v.voucher_type = 'Purchase'
            ),
            sales AS (
                SELECT
                    vsi.stock_item_id,
                    ABS(vsi.quantity) qty,
                    SUM(ABS(vsi.quantity)) OVER (
                        PARTITION BY vsi.stock_item_id
                        ORDER BY v.voucher_date, vsi.id
                    ) cum_qty,
                    SUM(ABS(vsi.quantity)) OVER (
                        PARTITION BY vsi.stock_item_id
                        ORDER BY v.voucher_date, vsi.id
                    ) - ABS(vsi.quantity) prev_cum_qty
                FROM vouchers v
                JOIN voucher_stock_items vsi ON vsi.voucher_guid = v.guid
                WHERE v.voucher_type = 'Sales'
                  AND v.voucher_date BETWEEN :start AND :end
            )
            SELECT ROUND(SUM(
                (
                    LEAST(p.cum_qty, s.cum_qty)
                    - GREATEST(p.prev_cum_qty, s.prev_cum_qty)
                ) * p.rate
            ), 2)
            FROM sales s
            JOIN purchase_layers p
              ON p.stock_item_id = s.stock_item_id
             AND p.cum_qty > s.prev_cum_qty
             AND p.prev_cum_qty < s.cum_qty
        """),
        {"start": start_date, "end": end_date}
    ).scalar() or 0)

# =====================================================
# OPENING STOCK
# =====================================================
def get_opening_stock(db: Session, month_key: str) -> float:
    return float(db.execute(
        text("""
            SELECT ABS(opening)
            FROM product_stock_summary
            WHERE month = :month
        """),
        {"month": month_key}
    ).scalar() or 0)

# =====================================================
# CASH − BANK OD
# =====================================================
def calculate_cash_minus_bank_od(db: Session, as_on_date: date) -> float:
    rows = db.execute(
        text("""
            SELECT lg.name, SUM(l.opening_balance + COALESCE(v.amount,0)) bal
            FROM ledgers l
            JOIN ledger_groups lg ON lg.id = l.ledger_group_id
            LEFT JOIN (
                SELECT vl.ledger_id, SUM(vl.amount) amount
                FROM voucher_ledgers vl
                JOIN vouchers v ON v.guid = vl.guid
                WHERE v.voucher_date <= :dt
                GROUP BY vl.ledger_id
            ) v ON v.ledger_id = l.id
            WHERE lg.name IN ('Cash-in-Hand','Bank OD A/c')
            GROUP BY lg.name
        """),
        {"dt": as_on_date}
    ).fetchall()

    cash = bank = 0
    for g, bal in rows:
        if g == "Cash-in-Hand":
            cash = bal or 0
        if g == "Bank OD A/c":
            bank = bal or 0

    return round(abs(cash) - bank, 2)

# =====================================================
# DEBTORS TOTAL
# =====================================================
def calculate_debtors_outstanding(db: Session) -> float:
    return float(db.execute(
        text("""
            SELECT SUM(os.outstanding_amount)
            FROM outstanding_snapshot os
            JOIN ledgers l ON l.name = os.party_name
            JOIN ledger_groups lg ON lg.id = l.ledger_group_id
            WHERE os.party_type = 'DEBTOR'
              AND lg.name = 'Sundry Debtors'
              AND os.snapshot_date = (
                SELECT MAX(snapshot_date)
                FROM outstanding_snapshot
              )
        """)
    ).scalar() or 0)

# =====================================================
# CREDITORS TOTAL
# =====================================================
def calculate_creditors_outstanding(db: Session) -> float:
    return float(db.execute(
        text("""
            SELECT SUM(os.outstanding_amount)
            FROM outstanding_snapshot os
            JOIN ledgers l ON l.name = os.party_name
            JOIN ledger_groups lg ON lg.id = l.ledger_group_id
            WHERE os.party_type = 'CREDITOR'
              AND lg.name = 'Sundry Creditors'
              AND os.snapshot_date = (
                SELECT MAX(snapshot_date)
                FROM outstanding_snapshot
              )
        """)
    ).scalar() or 0)

# =====================================================
# QUOTATION TOTAL
# =====================================================
def calculate_quotation_total(db: Session, days: int | None = None) -> float:
    days = int(ENV_QUOTATION_DAYS or 30)
    to_date = date.today()
    from_date = to_date - timedelta(days=days)

    return float(db.execute(
        text("""
            SELECT COALESCE(SUM(ABS(vl.amount)), 0)
            FROM vouchers v
            JOIN voucher_ledgers vl ON vl.guid = v.guid
            WHERE v.voucher_type LIKE '%Quotation%'
            AND vl.amount < 0
            AND LOWER(vl.ledger_name) NOT LIKE '%round%'
            AND LOWER(vl.ledger_name) NOT LIKE '%gst%'
            AND v.voucher_date BETWEEN :from AND :to
        """),
        {"from": from_date, "to": to_date}
    ).scalar() or 0)



def fetch_sales_vouchers(
    db: Session,
    start_date: date,
    end_date: date,
    user_id: int,
    role_id: int,
    search: str | None,
    limit: int,
    offset: int,
):
    where_search = ""
    params = {
        "start": start_date,
        "end": end_date,
        "user_id": user_id,
        "role_id": role_id,
        "limit": limit,
        "offset": offset,
    }

    if search:
        where_search = "AND (v.voucher_no LIKE :search OR v.party_name LIKE :search)"
        params["search"] = f"%{search}%"

    sql = text(f"""
        SELECT
            v.guid,
            v.voucher_no,
            v.voucher_date,
            v.party_name,
            v.voucher_type,
            SUM(
                CASE
                    WHEN v.voucher_type = 'Sales' THEN vl.amount
                    WHEN v.voucher_type = 'Credit Note' THEN -ABS(vl.amount)
                    ELSE 0
                END
            ) AS amount_with_gst
        FROM vouchers v
        JOIN voucher_ledgers vl ON vl.guid = v.guid
        LEFT JOIN voucher_cost_allocs vcs ON vcs.voucher_guid = v.guid
        LEFT JOIN user_cost_allocs uca
            ON uca.cost_centre = vcs.cost_centre
            AND uca.user_id = :user_id
            AND uca.is_deleted = 0
        WHERE
            v.voucher_type IN ('Sales', 'Credit Note')
            AND (
                vl.ledger_name LIKE '%Sales%'
                OR vl.ledger_name LIKE '%IGST%'
                OR vl.ledger_name LIKE '%CGST%'
                OR vl.ledger_name LIKE '%SGST%'
            )
            AND v.voucher_date BETWEEN :start AND :end
            AND (
                :role_id = 1
                OR uca.user_id IS NOT NULL
            )
            {where_search}
        GROUP BY
            v.guid,
            v.voucher_no,
            v.voucher_date,
            v.party_name,
            v.voucher_type
        ORDER BY v.voucher_date DESC, v.voucher_no DESC
        LIMIT :limit OFFSET :offset
    """)

    rows = db.execute(sql, params).fetchall()

    return [
        {
            "voucher_guid": r[0],
            "voucher_no": r[1],
            "voucher_date": r[2],
            "party_name": r[3],
            "voucher_type": r[4],
            "amount_with_gst": round(float(r[5] or 0), 2),
        }
        for r in rows
    ]

def count_sales_vouchers(
    db: Session,
    start_date: date,
    end_date: date,
    user_id: int,
    role_id: int,
    search: str | None,
):
    where_search = ""
    params = {
        "start": start_date,
        "end": end_date,
        "user_id": user_id,
        "role_id": role_id,
    }

    if search:
        where_search = "AND (v.voucher_no LIKE :search OR v.party_name LIKE :search)"
        params["search"] = f"%{search}%"

    sql = text(f"""
        SELECT COUNT(DISTINCT v.guid)
        FROM vouchers v
        JOIN voucher_ledgers vl ON vl.guid = v.guid
        LEFT JOIN voucher_cost_allocs vcs ON vcs.voucher_guid = v.guid
        LEFT JOIN user_cost_allocs uca
            ON uca.cost_centre = vcs.cost_centre
            AND uca.user_id = :user_id
            AND uca.is_deleted = 0
        WHERE
            v.voucher_type IN ('Sales', 'Credit Note')
            AND (
                vl.ledger_name LIKE '%Sales%'
                OR vl.ledger_name LIKE '%IGST%'
                OR vl.ledger_name LIKE '%CGST%'
                OR vl.ledger_name LIKE '%SGST%'
            )
            AND v.voucher_date BETWEEN :start AND :end
            AND (
                :role_id = 1
                OR uca.user_id IS NOT NULL
            )
            {where_search}
    """)

    return db.execute(sql, params).scalar() or 0


def get_total_incentive_for_dashboard(
    db: Session,
    from_date,
    to_date,
    current_user
) -> float:

    # 🔹 Normal user → only own incentive
    if current_user.role_id > 1:
        user_sales = calculate_net_sales(
            db,
            from_date,
            to_date,
            current_user.id,
            current_user.role_id
        )

        return float(
            calculate_multi_level_incentive(user_sales or 0, db)
        )

    # 🔹 Admin user → sum of all users' incentives
    users = db.query(User.id, User.role_id).all()

    total_incentive = 0.0

    for user in users:
        user_sales = calculate_net_sales(
            db,
            from_date,
            to_date,
            user.id,
            user.role_id
        )

        user_incentive = calculate_multi_level_incentive(
            float(user_sales or 0),
            db
        )

        total_incentive += float(user_incentive or 0)

    return total_incentive



@router.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    customers = db.execute(text("""
        SELECT *
        FROM ledgers
        WHERE parent = 'Sundry Debtors'
        ORDER BY name
    """)).fetchall()

    return len(customers)


# =====================================================
# DASHBOARD SUMMARY (UNCHANGED)
# =====================================================


@router.get("/summary")
def dashboard_summary(
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
   
    today = date.today()
    month_start = today.replace(day=1)
    month_key = from_date.strftime("%Y-%m")

    opening = get_opening_stock(db, month_key)
    purchases = calculate_purchases(db, from_date, to_date)
    fifo = calculate_fifo_sales_cost(db, from_date, to_date)
    closing = round(opening + purchases - fifo, 2)


    incentive_value = round(
        get_total_incentive_for_dashboard(
            db,
            from_date,
            to_date,
            current_user
        ),
        2
    )

    return {
        "summary": [
            {
                "key": "today_sales",
                "title": "Today Sales",
                "value": calculate_net_sales(
                    db, today, today,
                    current_user.id,
                    current_user.role_id
                ),
                "bg": "bg-light-green",
                "popup": True
            },
            {
                "key": "current_month_sales",
                "title": "Current Month Sales",
                "value": calculate_net_sales(
                    db, month_start, today,
                    current_user.id,
                    current_user.role_id
                ),
                "bg": "bg-light-blue",
                "popup": True
            },
            {
                "key": "selected_period_sales",
                "title": "Selected Period Sales",
                "value": calculate_net_sales(
                    db, from_date, to_date,
                    current_user.id,
                    current_user.role_id
                ),
                "bg": "bg-light-pink",
                "popup": True
            },
            {"key":"inventory","title":"Stock","value":closing,"bg":"bg-light-orange","popup":True},
            {"key":"cash_balance","title":"Funds","value":calculate_cash_minus_bank_od(db,to_date),"bg":"bg-light-green"},
            {"key":"debtors","title":"Receivables","value":round(calculate_debtors_outstanding(db),2),"bg":"bg-light-blue","popup":True},
            {"key":"creditors","title":"Payables","value":round(calculate_creditors_outstanding(db),2),"bg":"bg-light-pink","popup":True},
            {"key":"quotation","title":"Quotations","value":round(calculate_quotation_total(db),2),"bg":"bg-light-orange","popup":True},
             {"key":"incentive","title":"Incentive","value":incentive_value,"bg":"bg-light-green"},
            {"key":"customer","title":"Customers","value":get_customers(db),"bg":"bg-light-blue","popup":True},
        ]
    }

# =====================================================
# DASHBOARD DETAILS (WITH FILTERS + PAGING)
# =====================================================
from fastapi import Query, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from datetime import date, timedelta

@router.get("/details/{detail_type}")
def dashboard_details(
    detail_type: str,
    search: str | None = Query(None),
    aging: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    to_date: date | None = Query(None),
    from_date: date | None = Query(None),
    view: str | None = Query(None),       
    load_view: str | None = Query(None), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    state_id: int | None = Query(None),          # For customers
    district_id: int | None = Query(None),       # For customers
):
    search = search.strip() if search else None
    aging = aging.strip() if aging else None
    offset = (page - 1) * page_size
    user_id = current_user.id
    role_id = current_user.role_id
    # ======================================================
    # ✅ SALES / QUOTATION
    # ======================================================
    if detail_type in ("sales", "quotation"):

        voucher_like = "%sale%" if detail_type == "sales" else "%quotation%"

        params = {
            "limit": page_size,
            "offset": offset,
        }

        # --------------------------------------------------
        # 🔥 QUOTATION → FIXED DAYS RANGE
        # --------------------------------------------------
        if detail_type == "quotation":
            days = int(ENV_QUOTATION_DAYS or 30)
            to_dt = date.today()
            from_dt = to_dt - timedelta(days=days)

            date_filter = "v.voucher_date BETWEEN :from_date AND :to_date"
            params["from_date"] = from_dt
            params["to_date"] = to_dt

        # --------------------------------------------------
        # 🔥 SALES → LOAD VIEW BASED LOGIC
        # --------------------------------------------------
        else:
            load_view = (load_view or "").lower()

            if load_view == "today":
                # ✅ Today only
                date_filter = "v.voucher_date = CURDATE()"

            elif load_view == "current_month":
                # ✅ Current month (1st → today)
                date_filter = """
                    v.voucher_date BETWEEN
                    DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    AND CURDATE()
                """

            else:
                # ✅ Custom / selected period
                if not from_date or not to_date:
                    raise HTTPException(
                        status_code=400,
                        detail="from_date and to_date are required for custom view",
                    )

                date_filter = "v.voucher_date BETWEEN :from_date AND :to_date"
                params["from_date"] = from_date
                params["to_date"] = to_date

        # ---------------- SEARCH FILTER ----------------
        if search:
            params["search"] = f"%{search}%"

        # ---------------- SUMMARY ----------------
        user_filter = ""
        if detail_type == "sales":
            user_filter = """
                AND (
                    :role_id = 1
                    OR v.user_id = :user_id
                )
            """

        if detail_type == "quotation":
            voucher_filter = "v.voucher_type LIKE '%Quotation%'"
            voucher_con = "WHEN v.voucher_type LIKE '%Quotation%' THEN ABS(vl.amount)"
        else:
            voucher_filter = "v.voucher_type IN ('Sales', 'Credit Note')"
            voucher_con = "WHEN v.voucher_type = 'Sales' THEN vl.amount WHEN v.voucher_type = 'Credit Note' THEN -ABS(vl.amount)"
        
        summary_sql = f"""
            SELECT
            COUNT(DISTINCT v.id) AS total_vouchers,
            COALESCE(SUM(
                CASE
                    {voucher_con}
                    ELSE 0
                END
            ), 0) AS total_amount
        FROM vouchers v
        JOIN voucher_ledgers vl
            ON vl.guid = v.guid
 
        WHERE
            {voucher_filter}
            AND (
                vl.ledger_name LIKE '%Sales%'
                OR vl.ledger_name LIKE '%IGST%'
                OR vl.ledger_name LIKE '%CGST%'
                OR vl.ledger_name LIKE '%SGST%'
            )
            AND {date_filter}
           {user_filter}
        """
        exec_params = {**params, "voucher_like": voucher_like}

        if detail_type == "sales":
            exec_params.update({
                "user_id": user_id,
                "role_id": role_id,
            })

        summary = db.execute(
            text(summary_sql),
            exec_params
        ).fetchone()
        # ---------------- DATA ----------------
        data_sql = f"""
            SELECT
                v.id,
                v.guid,
                v.voucher_date,
                v.voucher_number,
                vl.ledger_name AS party_name,
                ABS(vl.amount) AS total_amount
            FROM vouchers v
            JOIN voucher_ledgers vl
                ON v.guid = vl.guid
            WHERE
                LOWER(v.voucher_type) LIKE :voucher_like
                AND vl.amount < 0
                AND LOWER(vl.ledger_name) NOT LIKE '%round%'
                AND LOWER(vl.ledger_name) NOT LIKE '%gst%'
                AND {date_filter}   {user_filter}
            ORDER BY v.voucher_date DESC, v.voucher_number DESC
            LIMIT :limit OFFSET :offset
        """

        rows = db.execute(
            text(data_sql),
            exec_params
        ).fetchall()

        return {
            "type": detail_type,
            "page": page,
            "page_size": page_size,
            "total": int(summary[0] or 0),
            "summary": {
                "total_sales": float(summary[1] or 0),
                "total_vouchers": int(summary[0] or 0),
            },
            "rows": [
                {
                    "id": r[0],
                    "guid": r[1],
                    "voucher_date": r[2],
                    "voucher_no": r[3],
                    "party_name": r[4],
                    "total_amount": float(r[5] or 0),
                }
                for r in rows
            ],
        }

       # ======================================================
    # ✅ CUSTOMERS (LEDGERS → SUNDRY DEBTORS)
    # ======================================================
    if detail_type == "customers":

        where = ["l.parent = 'Sundry Debtors'"]
        params = {"limit": page_size, "offset": offset}

        if search:
            where.append("(l.name LIKE :search OR l.mobile LIKE :search)")
            params["search"] = f"%{search}%"
        if state_id:
            where.append("l.state_id = :state_id")
            params["state_id"] = state_id
        if district_id:
            where.append("l.district_id = :district_id")
            params["district_id"] = district_id

        where_clause = " AND ".join(where)

        total = db.execute(
            text(f"SELECT COUNT(*) FROM ledgers l WHERE {where_clause}"),
            params
        ).scalar() or 0

        rows = db.execute(text(f"""
            SELECT
                l.id,
                l.name,
                l.mobile,
                s.name,
                d.name,
                l.pincode
            FROM ledgers l
            LEFT JOIN states s ON s.id = l.state_id
            LEFT JOIN districts d ON d.id = l.district_id
            WHERE {where_clause}
            ORDER BY l.name
            LIMIT :limit OFFSET :offset
        """), params).fetchall()

        return {
            "type": "customers",
            "page": page,
            "page_size": page_size,
            "total": total,
            "rows": [
                {
                    "id": r[0],
                    "name": r[1],
                    "mobile": r[2],
                    "state": r[3],
                    "district": r[4],
                    "pincode": r[5],
                }
                for r in rows
            ],
        }

  # ======================================================
    # ✅ DEBTORS / CREDITORS (UNCHANGED)
    # ======================================================
    if detail_type not in ("debtors", "creditors"):
        raise HTTPException(404, "Invalid detail type")

    party_type = "DEBTOR" if detail_type == "debtors" else "CREDITOR"
    group_like = "%Sundry Debtors%" if detail_type == "debtors" else "%Sundry Creditors%"

    where = [
        "os.party_type = :ptype",
        "LOWER(lg.name) LIKE LOWER(:gname)",
        "os.outstanding_amount > 0",
        """os.snapshot_date = COALESCE(
            (
                SELECT MAX(snapshot_date)
                FROM outstanding_snapshot
                WHERE snapshot_date <= :as_on_date
            ),
            (
                SELECT MAX(snapshot_date)
                FROM outstanding_snapshot
            )
        )"""
    ]

    params = {
        "ptype": party_type,
        "gname": group_like,
        "limit": page_size,
        "offset": offset,
        "as_on_date": to_date or date.today(),
    }

    if search:
        where.append("os.party_name LIKE :search")
        params["search"] = f"%{search}%"

    if aging == "0-30":
        where.append("os.overdue_days BETWEEN 0 AND 30")
    elif aging == "31-60":
        where.append("os.overdue_days BETWEEN 31 AND 60")
    elif aging == "60+":
        where.append("os.overdue_days > 60")

    where_clause = " AND ".join(where)

    summary_sql = f"""
        SELECT
            SUM(os.outstanding_amount),
            SUM(
                CASE
                    WHEN os.overdue_days > 0
                    THEN os.outstanding_amount
                    ELSE 0
                END
            )
        FROM outstanding_snapshot os
        JOIN ledgers l ON l.name = os.party_name
        JOIN ledger_groups lg ON lg.id = l.ledger_group_id
        WHERE {where_clause}
    """

    summary_row = db.execute(text(summary_sql), params).fetchone()

    data_sql = f"""
        SELECT
            os.party_name,
            SUM(os.outstanding_amount),
            MAX(os.bill_date),
            MAX(os.due_date),
            SUM(
                CASE
                    WHEN os.overdue_days > 0
                    THEN os.outstanding_amount
                    ELSE 0
                END
            ),
            MAX(os.overdue_days)
        FROM outstanding_snapshot os
        JOIN ledgers l ON l.name = os.party_name
        JOIN ledger_groups lg ON lg.id = l.ledger_group_id
        WHERE {where_clause}
        GROUP BY os.party_name
        ORDER BY SUM(os.outstanding_amount) DESC
        LIMIT :limit OFFSET :offset
    """

    count_sql = f"""
        SELECT COUNT(DISTINCT os.party_name)
        FROM outstanding_snapshot os
        JOIN ledgers l ON l.name = os.party_name
        JOIN ledger_groups lg ON lg.id = l.ledger_group_id
        WHERE {where_clause}
    """

    rows = db.execute(text(data_sql), params).fetchall()
    total = db.execute(text(count_sql), params).scalar() or 0

    return {
        "type": detail_type,
        "page": page,
        "page_size": page_size,
        "total": total,
        "summary": {
            "total_amount": float(summary_row[0] or 0),
            "overdue_amount": float(summary_row[1] or 0),
        },
        "rows": [
            {
                "party_name": r[0],
                "party_total": float(r[1] or 0),
                "bill_date": r[2],
                "due_date": r[3],
                "overdue_amount": float(r[4] or 0),
                "overdue_days": int(r[5] or 0),
            }
            for r in rows
        ],
    }

