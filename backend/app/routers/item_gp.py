from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(prefix="/api", tags=["Item GP"])


# 1️⃣ ITEM LIST (REQUIRED FOR SELECTION)
@router.get("/stock-items")
def stock_items(db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT guid, name
        FROM stock_items
        ORDER BY name
    """)).fetchall()

    return [{"guid": r[0], "name": r[1]} for r in rows]


# 2️⃣ ITEM GP TREND
@router.get("/item-gp/{item_guid}")
def item_gp_trend(item_guid: str, db: Session = Depends(get_db)):
    rows = db.execute(text("""
        SELECT
            v.voucher_date::date AS date,
            ABS(vsi.amount) AS sales
        FROM voucher_stock_items vsi
        JOIN vouchers v ON v.guid = vsi.voucher_guid
        WHERE
            vsi.stock_item_guid = :item
            AND LOWER(v.voucher_type) LIKE '%sale%'
        ORDER BY v.voucher_date
    """), {"item": item_guid}).fetchall()

    result = []

    for dt, sales in rows:
        cost = round(sales * 0.7, 2)  # 🔴 TEMP (FIFO will replace)
        gp = round(sales - cost, 2)
        gp_percent = round((gp / sales) * 100, 2) if sales else 0

        result.append({
            "date": str(dt),
            "sales": float(sales),
            "cost": cost,
            "gp": gp,
            "gp_percent": gp_percent
        })

    return result
