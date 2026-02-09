from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date
from app.core.database import get_db

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])


@router.get("/{voucher_guid}")
def quotation_detail(voucher_guid: str, db: Session = Depends(get_db)):

    # =====================================================
    # VOUCHER MASTER
    # =====================================================
    voucher = db.execute(text("""
        SELECT
            id,
            guid,
            voucher_number,
            voucher_date,
            narration
        FROM vouchers
        WHERE guid = :guid
          AND LOWER(voucher_type) LIKE '%quotation%'
    """), {"guid": voucher_guid}).fetchone()

    if not voucher:
        raise HTTPException(404, "Quotation not found")

    voucher_id = voucher[0]
    voucher_date = voucher[3]

    # =====================================================
    # LEDGERS (DISPLAY ONLY)
    # =====================================================
    ledgers = db.execute(text("""
        SELECT ledger_name, amount
        FROM voucher_ledgers
        WHERE guid = :guid
        ORDER BY line_no
    """), {"guid": voucher_guid}).fetchall()

    # =====================================================
    # STOCK ITEMS
    # (Tally may store by voucher_guid OR voucher_id)
    # =====================================================
    items_raw = db.execute(text("""
        SELECT
            vsi.stock_item_guid,
            si.name,
            ABS(vsi.quantity) AS qty,
            vsi.quantity_unit,
            ABS(vsi.amount) AS amount
        FROM voucher_stock_items vsi
        JOIN stock_items si ON si.guid = vsi.stock_item_guid
        WHERE
            vsi.voucher_guid = :guid
            OR vsi.voucher_id = :vid
    """), {
        "guid": voucher_guid,
        "vid": voucher_id
    }).fetchall()

    # =====================================================
    # FORECAST COST = LAST PURCHASE RATE (<= QUOTATION DATE)
    # =====================================================
    def forecast_cost(item_guid: str, qty: float) -> float:
        if qty <= 0:
            return 0.0

        row = db.execute(text("""
            SELECT
                ABS(vsi.amount) / NULLIF(ABS(vsi.quantity), 0) AS rate
            FROM voucher_stock_items vsi
            JOIN vouchers v ON v.guid = vsi.voucher_guid
            WHERE
                vsi.stock_item_guid = :item
                AND LOWER(v.voucher_type) LIKE '%purchase%'
                AND v.voucher_date <= :dt
                AND vsi.quantity != 0
            ORDER BY v.voucher_date DESC, vsi.id DESC
            LIMIT 1
        """), {
            "item": item_guid,
            "dt": voucher_date
        }).fetchone()

        rate = float(row[0]) if row else 0.0
        return round(rate * qty, 2)

    # =====================================================
    # BUILD ITEM VIEW
    # =====================================================
    items = []
    total_sales = 0.0
    total_cost = 0.0

    for r in items_raw:
        item_guid = r[0]
        name = r[1]
        qty = float(r[2] or 0)
        unit = r[3]
        amount = float(r[4] or 0)

        rate = round(amount / qty, 2) if qty else 0.0
        cost = forecast_cost(item_guid, qty)

        gp = round(amount - cost, 2)
        gp_percent = round((gp / amount) * 100, 2) if amount else 0.0

        items.append({
            "item_name": name,
            "quantity": qty,
            "unit": unit,
            "rate": rate,
            "amount": round(amount, 2),
            "forecast_cost": cost,
            "gp": gp,
            "gp_percent": gp_percent,
        })

        total_sales += amount
        total_cost += cost

    # =====================================================
    # GP SUMMARY (ITEM BASED – TALLY STYLE)
    # =====================================================
    total_sales = round(total_sales, 2)
    total_cost = round(total_cost, 2)
    gross_profit = round(total_sales - total_cost, 2)
    gp_percent = round((gross_profit / total_sales) * 100, 2) if total_sales else 0.0

    # =====================================================
    # FINAL RESPONSE
    # =====================================================
    return {
        "voucher": {
            "guid": voucher[1],
            "voucher_number": voucher[2],
            "voucher_date": voucher[3],
            "narration": voucher[4],
            "type": "Quotation",
        },
        "ledgers": [
            {
                "ledger_name": l[0],
                "amount": abs(float(l[1])),
                "type": "Dr" if l[1] < 0 else "Cr",
            }
            for l in ledgers
        ],
        "items": items,
        "gp_summary": {
            "sales_value": total_sales,
            "forecast_cost": total_cost,
            "gross_profit": gross_profit,
            "gp_percent": gp_percent,
            "note": "Forecast based on last purchase price",
        },
    }
