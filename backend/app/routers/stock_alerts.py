from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(
    prefix="/api/stock-alerts",
    tags=["Stock Alerts"]
)


@router.get("/low-stock")
def stock_items_with_status(
    threshold: float = Query(10, description="Low stock threshold"),
    db: Session = Depends(get_db),
):
    """
    Returns ALL stock items with:
    - group_name (for group filter)
    - available_qty
    - available_value (₹ positive)
    - status: OK / LOW / OUT

    NOTE:
    threshold is used ONLY to calculate status
    """

    rows = db.execute(
        text("""
            SELECT
                si.guid,
                si.name            AS item_name,
                sg.name            AS group_name,
                si.base_unit,
                si.closing_balance,
                si.closing_value
            FROM stock_items si
            LEFT JOIN stock_groups sg
                ON sg.guid = si.stock_group_guid
            ORDER BY
                COALESCE(sg.name, 'ZZZ'),
                si.name
        """)
    ).fetchall()

    result = []

    for r in rows:
        qty = float(r[4] or 0)
        value = abs(float(r[5] or 0))   # ✅ Tally accounting fix

        if qty == 0:
            status = "OUT"
        elif qty <= threshold:
            status = "LOW"
        else:
            status = "OK"

        result.append({
            "guid": r[0],
            "item_name": r[1],
            "group_name": r[2] or "Ungrouped",
            "unit": r[3],
            "available_qty": round(qty, 2),
            "available_value": round(value, 2),
            "status": status
        })

    return result
