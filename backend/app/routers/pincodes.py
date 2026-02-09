from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.pincode import Pincode
from app.schemas.pincode import (
    PincodeCreate, PincodeUpdate, PincodeOut
)

router = APIRouter(prefix="/api/pincodes", tags=["Pincodes"])

@router.get("/", response_model=list[PincodeOut])
def list_pincodes(
    district_id: int = Query(...),
    db: Session = Depends(get_db)
):
    return (
        db.query(Pincode)
        .filter(Pincode.district_id == district_id)
        .order_by(Pincode.pincode)
        .all()
    )

@router.post("/", response_model=PincodeOut)
def create_pincode(data: PincodeCreate, db: Session = Depends(get_db)):
    pincode = Pincode(**data.dict())
    db.add(pincode)
    db.commit()
    db.refresh(pincode)
    return pincode

@router.put("/{pincode_id}", response_model=PincodeOut)
def update_pincode(
    pincode_id: int,
    data: PincodeUpdate,
    db: Session = Depends(get_db)
):
    pincode = db.get(Pincode, pincode_id)
    if not pincode:
        raise HTTPException(404, "Pincode not found")

    for k, v in data.dict().items():
        setattr(pincode, k, v)

    db.commit()
    return pincode

@router.delete("/{pincode_id}")
def delete_pincode(pincode_id: int, db: Session = Depends(get_db)):
    pincode = db.get(Pincode, pincode_id)
    if not pincode:
        raise HTTPException(404, "Pincode not found")

    db.delete(pincode)
    db.commit()
    return {"success": True}
