from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.district import District
from app.schemas.district import (
    DistrictCreate, DistrictUpdate, DistrictOut
)
from typing import Optional
router = APIRouter(prefix="/api/districts", tags=["Districts"])

@router.get("/", response_model=list[DistrictOut])
def list_districts(
    state_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(District)

    if state_id:
        query = query.filter(District.state_id == state_id)

    return query.order_by(District.name).all()

@router.post("/", response_model=DistrictOut)
def create_district(data: DistrictCreate, db: Session = Depends(get_db)):
    district = District(**data.dict())
    db.add(district)
    db.commit()
    db.refresh(district)
    return district

@router.put("/{district_id}", response_model=DistrictOut)
def update_district(
    district_id: int,
    data: DistrictUpdate,
    db: Session = Depends(get_db)
):
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(404, "District not found")

    for k, v in data.dict().items():
        setattr(district, k, v)

    db.commit()
    return district

@router.delete("/{district_id}")
def delete_district(district_id: int, db: Session = Depends(get_db)):
    district = db.get(District, district_id)
    if not district:
        raise HTTPException(404, "District not found")

    db.delete(district)
    db.commit()
    return {"success": True}
