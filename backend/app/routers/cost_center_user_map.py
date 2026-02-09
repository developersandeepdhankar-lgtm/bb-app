from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(
    prefix="/api/cost-center-user-maps",
    tags=["Cost Center User Map"]
)

# ---------------------------------
# GET UNASSIGNED COST CENTERS (NAME)
# ---------------------------------
@router.get("/available")
def get_available_cost_centers(db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
            SELECT DISTINCT vca.cost_centre
            FROM voucher_cost_allocs vca
            WHERE vca.cost_centre IS NOT NULL
              AND vca.cost_centre NOT IN (
                  SELECT m.cost_centre
                  FROM cost_center_user_maps m
              )
            ORDER BY vca.cost_centre
        """)
    ).fetchall()

    return [r.cost_centre for r in rows]

# ---------------------------------
# GET COST CENTERS OF A USER
# ---------------------------------
@router.get("/user/{user_id}")
def get_user_cost_centers(user_id: int, db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
            SELECT id, cost_centre
            FROM cost_center_user_maps
            WHERE user_id = :uid
            ORDER BY cost_centre
        """),
        {"uid": user_id}
    ).fetchall()

    return [{"id": r.id, "cost_centre": r.cost_centre} for r in rows]

# ---------------------------------
# MAP COST CENTER TO USER
# ---------------------------------
@router.post("")
def map_cost_center(payload: dict, db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    cost_centre = payload.get("cost_centre")

    if not user_id or not cost_centre:
        raise HTTPException(400, "Invalid payload")

    # 🔒 pre-check (important)
    exists = db.execute(
        text("""
            SELECT 1
            FROM cost_center_user_maps
            WHERE cost_centre = :cc
        """),
        {"cc": cost_centre}
    ).fetchone()

    if exists:
        raise HTTPException(
            status_code=409,
            detail="Cost center already assigned to another user"
        )

    db.execute(
        text("""
            INSERT INTO cost_center_user_maps (user_id, cost_centre)
            VALUES (:uid, :cc)
        """),
        {"uid": user_id, "cc": cost_centre}
    )
    db.commit()

    return {"message": "Mapped successfully"}

# ---------------------------------
# REMOVE COST CENTER FROM USER
# ---------------------------------
@router.delete("/{map_id}")
def remove_cost_center_map(map_id: int, db: Session = Depends(get_db)):
    res = db.execute(
        text("""
            DELETE FROM cost_center_user_maps
            WHERE id = :id
        """),
        {"id": map_id}
    )

    if res.rowcount == 0:
        raise HTTPException(404, "Mapping not found")

    db.commit()
    return {"message": "Removed"}
