from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(prefix="/api/vouchers", tags=["Vouchers"])


@router.get("/{voucher_guid}")
def voucher_detail(voucher_guid: str, db: Session = Depends(get_db)):

    # =====================================================
    # VOUCHER MASTER
    # =====================================================
    voucher = db.execute(text("""
        SELECT
            guid,
            voucher_number,
            voucher_type,
            voucher_date,
            narration
        FROM vouchers
        WHERE guid = :guid
    """), {"guid": voucher_guid}).fetchone()

    if not voucher:
        raise HTTPException(404, "Voucher not found")

    voucher_date = voucher.voucher_date

    # =====================================================
    # LEDGERS (TALLY ORDER)
    # =====================================================
    ledgers = db.execute(text("""
        SELECT ledger_name, amount
        FROM voucher_ledgers
        WHERE guid = :guid
        ORDER BY line_no
    """), {"guid": voucher_guid}).fetchall()

    # =====================================================
    # SALES ITEMS (CURRENT VOUCHER)
    # =====================================================
    sales_items = db.execute(text("""
        SELECT
            vsi.stock_item_guid,
            si.name,
            vsi.quantity,
            vsi.quantity_unit,
            vsi.amount
        FROM voucher_stock_items vsi
        JOIN stock_items si ON si.guid = vsi.stock_item_guid
        WHERE vsi.voucher_guid = :guid
    """), {"guid": voucher_guid}).fetchall()

    # =====================================================
    # FIFO COST – TRUE TALLY STYLE
    # =====================================================
    def fifo_cost(item_guid: str, sale_qty: float):
        """
        Tally-style FIFO:
        - Builds FIFO layers from purchases
        - Consumes past sales
        - Current sale consumes remaining layers
        - Negative stock uses last purchase rate
        """

        movements = db.execute(text("""
            SELECT
                vsi.quantity,
                vsi.amount,
                v.voucher_date,
                v.id
            FROM voucher_stock_items vsi
            JOIN vouchers v ON v.guid = vsi.voucher_guid
            WHERE
                vsi.stock_item_guid = :item_guid
                AND v.voucher_date <= :voucher_date
            ORDER BY v.voucher_date, v.id
        """), {
            "item_guid": item_guid,
            "voucher_date": voucher_date
        }).fetchall()

        fifo_layers = []
        last_purchase_rate = 0.0

        # -----------------------------
        # Build FIFO layers
        # -----------------------------
        for qty, amt, _, _ in movements:
            qty = float(qty)
            amt = float(amt or 0)

            if qty > 0:
                rate = abs(amt) / qty if qty else 0
                fifo_layers.append({
                    "qty": qty,
                    "rate": rate
                })
                last_purchase_rate = rate
            else:
                consume_qty = abs(qty)
                for layer in fifo_layers:
                    if consume_qty <= 0:
                        break
                    used = min(layer["qty"], consume_qty)
                    layer["qty"] -= used
                    consume_qty -= used

        # -----------------------------
        # Apply CURRENT sale
        # -----------------------------
        remaining_sale = abs(sale_qty)
        cost = 0.0

        for layer in fifo_layers:
            if remaining_sale <= 0:
                break
            used = min(layer["qty"], remaining_sale)
            cost += used * layer["rate"]
            remaining_sale -= used

        negative_stock = remaining_sale > 0

        # 🔥 TALLY RULE: use last purchase rate for negative qty
        if negative_stock and last_purchase_rate > 0:
            cost += remaining_sale * last_purchase_rate

        available_qty = sum(l["qty"] for l in fifo_layers)

        return round(cost, 2), round(available_qty, 2), negative_stock

    # =====================================================
    # BUILD ITEM VIEW
    # =====================================================
    items = []
    total_sales = 0.0
    total_cost = 0.0

    for r in sales_items:
        item_guid = r.stock_item_guid
        name = r.name
        qty = abs(float(r.quantity))
        unit = r.quantity_unit
        amount = abs(float(r.amount))

        rate = round(amount / qty, 2) if qty else 0.0
        cost, available_qty, negative = fifo_cost(item_guid, qty)

        gp = amount - cost
        gp_percent = (gp / amount * 100) if amount else 0.0

        items.append({
            "item_name": name,
            "quantity": qty,
            "unit": unit,
            "rate": rate,
            "amount": round(amount, 2),
            "cost_amount": round(cost, 2),
            "gp": round(gp, 2),
            "gp_percent": round(gp_percent, 2),
            "available_qty": available_qty,
            "negative_stock": negative,
        })

        total_sales += amount
        total_cost += cost

    gross_profit = total_sales - total_cost
    gp_percent = (gross_profit / total_sales * 100) if total_sales else 0.0

    # =====================================================
    # FINAL RESPONSE
    # =====================================================
    return {
        "voucher": {
            "guid": voucher.guid,
            "voucher_number": voucher.voucher_number,
            "voucher_type": voucher.voucher_type,
            "voucher_date": voucher.voucher_date,
            "narration": voucher.narration,
        },
        "ledgers": [
            {
                "ledger_name": l.ledger_name,
                "amount": float(l.amount),
                "type": "Dr" if l.amount < 0 else "Cr",
                "abs_amount": abs(float(l.amount)),
            }
            for l in ledgers
        ],
        "items": items,
        "gp_summary": {
            "sales_value": round(total_sales, 2),
            "cost_value": round(total_cost, 2),
            "gross_profit": round(gross_profit, 2),
            "gp_percent": round(gp_percent, 2),
        },
    }
