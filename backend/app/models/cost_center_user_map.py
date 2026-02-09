# app/routers/cost_center_user_map.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.cost_center_user_map import CostCenterUserMap

router = APIRouter(
    prefix="/api/cost-center-user-maps",
    tags=["Cost Center User Mapping"]
)

@router.post("/")
def create_mapping(
    user_id: int,
    voucher_cost_alloc_id: int,
    db: Session = Depends(get_db)
):
    exists = db.query(CostCenterUserMap).filter(
        CostCenterUserMap.user_id == user_id,
        CostCenterUserMap.voucher_cost_alloc_id == voucher_cost_alloc_id
    ).first()

    if exists:
        raise HTTPException(400, "Mapping already exists")

    row = CostCenterUserMap(
        user_id=user_id,
        voucher_cost_alloc_id=voucher_cost_alloc_id
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
