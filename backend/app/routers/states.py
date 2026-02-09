from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.state import State
from app.schemas.state import StateCreate, StateUpdate, StateOut
from sqlalchemy import text
from fastapi import Query
from app.models.user import User
from app.routers.auth import get_current_user
from datetime import date
router = APIRouter(prefix="/api/states", tags=["States"])


@router.get("/", response_model=list[StateOut])
def list_states(db: Session = Depends(get_db)):
    return db.query(State).order_by(State.name).all()


@router.post("/", response_model=StateOut)
def create_state(data: StateCreate, db: Session = Depends(get_db)):
    state = State(**data.dict())
    db.add(state)
    db.commit()
    db.refresh(state)
    return state


@router.put("/{state_id}", response_model=StateOut)
def update_state(state_id: int, data: StateUpdate, db: Session = Depends(get_db)):
    state = db.get(State, state_id)
    if not state:
        raise HTTPException(status_code=404, detail="State not found")

    update_data = data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(state, key, value)

    db.commit()
    db.refresh(state)
    return state


@router.delete("/{state_id}")
def delete_state(state_id: int, db: Session = Depends(get_db)):
    state = db.get(State, state_id)
    if not state:
        raise HTTPException(status_code=404, detail="State not found")

    db.delete(state)
    db.commit()
    return {"success": True}


@router.get("/map")
def state_target_vs_sales(
    from_date: date,
    to_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.execute(
        text("""
        SELECT
            s.id,
            s.name,
            s.svg_path,
            s.label_x,
            s.label_y,
            s.is_target,

            /* 🎯 TARGET LOGIC */
            CAST(
                CASE
                    WHEN :role_id = 1 THEN s.target
                    ELSE ust.target_value
                END AS DECIMAL(15,2)
            ) AS target,

            COALESCE(t.completed_sales, 0) AS completed_sales

        FROM states s

        /* 🎯 USER WISE TARGET */
        LEFT JOIN user_state_targets ust
            ON ust.state_id = s.id
           AND ust.user_id = :user_id

        /* 💰 SALES */
        LEFT JOIN (
            SELECT
                l.state_id,
                SUM(
                    CASE
                        WHEN v.voucher_type = 'Sales'
                             AND LOWER(vl.ledger_name) NOT LIKE '%gst%'
                             AND LOWER(vl.ledger_name) NOT LIKE '%igst%'
                             AND LOWER(vl.ledger_name) NOT LIKE '%cgst%'
                             AND LOWER(vl.ledger_name) NOT LIKE '%sgst%'
                             AND LOWER(vl.ledger_name) NOT LIKE '%round%'
                             AND LOWER(vl.ledger_name) NOT LIKE '%discount%'
                        THEN ABS(vl.amount)

                        WHEN v.voucher_type = 'Credit Note'
                             AND LOWER(vl.ledger_name) NOT LIKE '%gst%'
                        THEN -ABS(vl.amount)

                        ELSE 0
                    END
                ) AS completed_sales
            FROM vouchers v
            JOIN voucher_ledgers vl ON vl.guid = v.guid
            JOIN ledgers l ON l.id = vl.ledger_id
            WHERE v.voucher_date BETWEEN :from_date AND :to_date
              AND (
                    :role_id = 1
                    OR v.user_id = :user_id
                  )
            GROUP BY l.state_id
        ) t ON t.state_id = s.id

        WHERE s.svg_path IS NOT NULL
          AND s.svg_path != ''

        ORDER BY s.name
        """),
        {
            "from_date": from_date,
            "to_date": to_date,
            "role_id": current_user.role_id,
            "user_id": current_user.id,
        }
    ).mappings().all()

    result = []
    for r in rows:
        target = float(r["target"] or 0)
        completed = float(r["completed_sales"] or 0)
        achieved = round((completed / target) * 100, 2) if target > 0 else 0

        result.append({
            "id": r["id"],
            "name": r["name"],
            "svg_path": r["svg_path"],
            "label_x": float(r["label_x"]) if r["label_x"] else None,
            "label_y": float(r["label_y"]) if r["label_y"] else None,
            "target": target,
            "completed_sales": completed,
            "achieved_percent": achieved,
            "is_target": r["is_target"]
        })

    return {
        "from_date": from_date,
        "to_date": to_date,
        "states": result
    }
