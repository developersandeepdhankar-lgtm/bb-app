from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(
    prefix="/api/stock-groups",
    tags=["Stock Groups"]
)

# ---------------------------------------------------
# 🔁 Recursive roll-up for GROUP totals
# ---------------------------------------------------
def rollup_group_totals(node):
    item_count = 0
    total_qty = 0.0
    total_value = 0.0

    for child in node.get("children", []):
        # ITEM
        if child["type"] == "ITEM":
            item_count += 1
            total_qty += child.get("available_qty", 0)
            total_value += child.get("available_value", 0)

        # GROUP
        else:
            rollup_group_totals(child)
            item_count += child.get("item_count", 0)
            total_qty += child.get("total_qty", 0)
            total_value += child.get("total_value", 0)

    node["item_count"] = item_count
    node["total_qty"] = round(total_qty, 2)
    node["total_value"] = round(total_value, 2)


@router.get("/tree")
def stock_group_tree(db: Session = Depends(get_db)):

    # --------------------------------
    # 1️⃣ Load stock groups
    # --------------------------------
    groups = db.execute(text("""
        SELECT guid, name, parent
        FROM stock_groups
        ORDER BY name
    """)).fetchall()

    # --------------------------------
    # 2️⃣ Load stock items
    # --------------------------------
    items = db.execute(text("""
        SELECT
            guid,
            name,
            parent,
            stock_group_guid,
            closing_balance,
            closing_rate,
            closing_value
        FROM stock_items
        ORDER BY name
    """)).fetchall()

    # --------------------------------
    # 3️⃣ Build GROUP nodes
    # --------------------------------
    group_nodes = {}
    group_name_to_guid = {}

    for g in groups:
        group_nodes[g.guid] = {
            "guid": g.guid,
            "name": g.name,
            "type": "GROUP",
            "children": []
        }
        group_name_to_guid[g.name] = g.guid

    # --------------------------------
    # 4️⃣ Build ITEM nodes (FIXED VALUE)
    # --------------------------------
    item_nodes = {}

    for i in items:
        qty = float(i.closing_balance or 0)

        # ✅ FIX: ABS value (Tally accounting rule)
        value = abs(float(i.closing_value or 0))

        status = "OUT" if qty == 0 else "OK"

        item_nodes[i.guid] = {
            "guid": i.guid,
            "name": i.name,
            "type": "ITEM",
            "available_qty": qty,
            "rate": float(i.closing_rate or 0),
            "available_value": value,
            "status": status,
            "children": []
        }

    # --------------------------------
    # 5️⃣ Attach ITEMS (item → item OR group)
    # --------------------------------
    for i in items:
        node = item_nodes[i.guid]

        # Item under item
        if i.parent and i.parent in item_nodes:
            item_nodes[i.parent]["children"].append(node)

        # Item under group
        elif i.stock_group_guid in group_nodes:
            group_nodes[i.stock_group_guid]["children"].append(node)

    # --------------------------------
    # 6️⃣ Attach GROUP hierarchy
    # --------------------------------
    tree = []

    for g in groups:
        parent_guid = group_name_to_guid.get(g.parent)

        if parent_guid and parent_guid in group_nodes:
            group_nodes[parent_guid]["children"].append(group_nodes[g.guid])
        else:
            tree.append(group_nodes[g.guid])

    # --------------------------------
    # 7️⃣ Roll-up totals
    # --------------------------------
    for root in tree:
        rollup_group_totals(root)

    return tree
