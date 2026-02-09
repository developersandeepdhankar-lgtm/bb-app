from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date


class FIFOCostService:
    def __init__(self, db: Session):
        self.db = db

    def fifo_cost(self, item_guid: str, sale_qty: float, sale_date: date):
        """
        FIFO cost for a single item sale
        Returns: (cost_value, negative_stock)
        """
        remaining = abs(sale_qty)
        total_cost = 0.0

        purchases = self.db.execute(text("""
            SELECT
                v.voucher_date,
                ABS(vsi.quantity) qty,
                ABS(vsi.amount) amount
            FROM voucher_stock_items vsi
            JOIN vouchers v ON v.guid = vsi.voucher_guid
            WHERE
                vsi.stock_item_guid = :item
                AND LOWER(v.voucher_type) LIKE '%purchase%'
                AND v.voucher_date <= :dt
            ORDER BY v.voucher_date, vsi.id
        """), {
            "item": item_guid,
            "dt": sale_date
        }).fetchall()

        for p_date, qty, amt in purchases:
            if remaining <= 0:
                break

            if qty <= 0:
                continue

            unit_cost = amt / qty
            consume = min(qty, remaining)

            total_cost += consume * unit_cost
            remaining -= consume

        negative_stock = remaining > 0
        return round(total_cost, 2), negative_stock
