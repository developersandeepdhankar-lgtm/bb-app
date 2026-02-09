from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional

from app.core.database import get_db   # ✅ SAME AS DASHBOARD
from app.models.incentive_rule import IncentiveRule
from app.schemas.incentive_rule import (
    IncentiveRuleCreate,
    IncentiveRuleUpdate,
    IncentiveRuleOut
)

router = APIRouter(
    prefix="/api/incentive-rules",
    tags=["Incentive Rules"]
)

def validate_overlap(
    db: Session,
    min_amount: int,
    max_amount: Optional[int],
    exclude_id: Optional[int] = None
):
    query = db.query(IncentiveRule)

    if exclude_id:
        query = query.filter(IncentiveRule.id != exclude_id)

    overlap = query.filter(
        and_(
            or_(IncentiveRule.max_amount == None,
                IncentiveRule.max_amount >= min_amount),
            or_(max_amount == None,
                IncentiveRule.min_amount <= max_amount)
        )
    ).first()

    if overlap:
        raise HTTPException(
            status_code=400,
            detail=f"Overlapping range with rule ID {overlap.id}"
        )

@router.post("/", response_model=IncentiveRuleOut)
def create_rule(
    data: IncentiveRuleCreate,
    db: Session = Depends(get_db)
):
    validate_overlap(db, data.min_amount, data.max_amount)

    rule = IncentiveRule(**data.dict())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.put("/{rule_id}", response_model=IncentiveRuleOut)
def update_rule(
    rule_id: int,
    data: IncentiveRuleUpdate,
    db: Session = Depends(get_db)
):
    rule = db.query(IncentiveRule).filter(
        IncentiveRule.id == rule_id
    ).first()

    if not rule:
        raise HTTPException(404, "Rule not found")

    validate_overlap(
        db,
        data.min_amount,
        data.max_amount,
        exclude_id=rule_id
    )

    rule.min_amount = data.min_amount
    rule.max_amount = data.max_amount
    rule.incentive_percent = data.incentive_percent

    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(IncentiveRule).filter(
        IncentiveRule.id == rule_id
    ).first()

    if not rule:
        raise HTTPException(404, "Rule not found")

    db.delete(rule)
    db.commit()
    return {"message": "Deleted successfully"}

@router.get("/", response_model=List[IncentiveRuleOut])
def list_rules(db: Session = Depends(get_db)):
    return db.query(IncentiveRule)\
        .order_by(IncentiveRule.min_amount)\
        .all()
