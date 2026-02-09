from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date
from app.core.database import get_db

router = APIRouter(prefix="/api/stock-ageing", tags=["Stock Ageing"])


@router.get("/")
def stock_ageing(db: Session = Depends(get_db)):
    today = date.today()

    # --------------------------------------------------
    # 1️⃣ Load items WITH group
    # --------------------------------------------------
    items = db.execute(text("""
        SELECT
            si.guid,
            si.name,
            sg.name AS group_name,
            si.closing_balance
        FROM stock_items si
        LEFT JOIN stock_groups sg
            ON sg.guid = si.stock_group_guid
        WHERE si.closing_balance > 0
    """)).fetchall()

    item_map = {
        r.guid: {
            "item_name": r.name,
            "group_name": r.group_name or "Ungrouped",
            "balance": float(r.closing_balance),
            "0-30": 0.0,
            "31-60": 0.0,
            "60+": 0.0,
        }
        for r in items
    }

    if not item_map:
        return []

    # --------------------------------------------------
    # 2️⃣ INWARD movements (reverse date order)
    # --------------------------------------------------
    rows = db.execute(text("""
        SELECT
            vsi.stock_item_guid,
            v.voucher_date,
            vsi.quantity
        FROM voucher_stock_items vsi
        JOIN vouchers v ON v.guid = vsi.voucher_guid
        WHERE vsi.quantity > 0
        ORDER BY v.voucher_date DESC
    """)).fetchall()

    # --------------------------------------------------
    # 3️⃣ Allocate ageing from current stock
    # --------------------------------------------------
    for item_guid, v_date, qty in rows:
        if item_guid not in item_map:
            continue

        remaining = item_map[item_guid]["balance"]
        if remaining <= 0:
            continue

        qty = min(float(qty), remaining)
        age_days = (today - v_date).days

        if age_days <= 30:
            item_map[item_guid]["0-30"] += qty
        elif age_days <= 60:
            item_map[item_guid]["31-60"] += qty
        else:
            item_map[item_guid]["60+"] += qty

        item_map[item_guid]["balance"] -= qty

    # --------------------------------------------------
    # 4️⃣ Final response
    # --------------------------------------------------
    return [
        {
            "group_name": v["group_name"],
            "item_name": v["item_name"],
            "age_0_30": round(v["0-30"], 2),
            "age_31_60": round(v["31-60"], 2),
            "age_60_plus": round(v["60+"], 2),
        }
        for v in item_map.values()
    ]
