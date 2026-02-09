from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(prefix="/api/item-sales", tags=["Item Sales"])


@router.get("/{item_guid}")
def item_sales_history(
    item_guid: str,
    from_date: str | None = None,
    to_date: str | None = None,
    db: Session = Depends(get_db),
):
    where_date = ""
    params = {"item": item_guid}

    if from_date and to_date:
        where_date = "AND v.voucher_date BETWEEN :from AND :to"
        params["from"] = from_date
        params["to"] = to_date

    rows = db.execute(text(f"""
        SELECT
            v.voucher_date,
            v.voucher_number,
            ABS(vsi.quantity),
            ABS(vsi.amount)
        FROM voucher_stock_items vsi
        JOIN vouchers v ON v.guid = vsi.voucher_guid
        WHERE
            vsi.stock_item_guid = :item
            AND LOWER(v.voucher_type) LIKE '%sale%'
            {where_date}
        ORDER BY v.voucher_date DESC
    """), params).fetchall()

    return [
        {
            "date": r[0],
            "voucher_no": r[1],
            "quantity": float(r[2]),
            "amount": float(r[3]),
        }
        for r in rows
    ]
