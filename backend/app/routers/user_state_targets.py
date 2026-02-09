from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db

router = APIRouter(
    prefix="/api/user-state-targets",
    tags=["User State Targets"]
)

# -------------------------------------------------
# GET TARGETS FOR A USER
# -------------------------------------------------
@router.get("/{user_id}")
def get_user_state_targets(user_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT
                ust.state_id,
                s.name AS state_name,
                ust.target_value
            FROM user_state_targets ust
            JOIN states s ON s.id = ust.state_id
            WHERE ust.user_id = :uid
            ORDER BY s.name
        """),
        {"uid": user_id}
    ).mappings().all()

    return result


# -------------------------------------------------
# INSERT / UPDATE TARGET WITH PLUS–MINUS LOGIC
# -------------------------------------------------
@router.post("")
def save_user_state_target(payload: dict, db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    state_id = payload.get("state_id")
    target_value = float(payload.get("target_value", 0))

    if not user_id or not state_id:
        raise HTTPException(status_code=400, detail="Invalid payload")

    # -------------------------------------------------
    # 1️⃣ GET EXISTING TARGET (IF ANY)
    # -------------------------------------------------
    existing = db.execute(
        text("""
            SELECT target_value
            FROM user_state_targets
            WHERE user_id = :uid AND state_id = :sid
        """),
        {"uid": user_id, "sid": state_id}
    ).fetchone()

    old_value = float(existing[0]) if existing else 0
    diff = target_value - old_value   # 🔥 PLUS / MINUS

    # -------------------------------------------------
    # 2️⃣ UPSERT USER STATE TARGET
    # -------------------------------------------------
    db.execute(
        text("""
            INSERT INTO user_state_targets (user_id, state_id, target_value)
            VALUES (:uid, :sid, :tv)
            ON DUPLICATE KEY UPDATE
                target_value = :tv
        """),
        {
            "uid": user_id,
            "sid": state_id,
            "tv": target_value
        }
    )

    # -------------------------------------------------
    # 3️⃣ UPDATE STATE TOTAL TARGET (PLUS / MINUS)
    # -------------------------------------------------
    db.execute(
        text("""
            UPDATE states
            SET
                target = COALESCE(target, 0) + :diff,
                is_target = 1
            WHERE id = :sid
        """),
        {
            "diff": diff,
            "sid": state_id
        }
    )

    db.commit()
    return {"success": True}
