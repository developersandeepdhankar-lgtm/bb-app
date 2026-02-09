from pydantic import BaseModel, field_validator
from typing import Optional

class IncentiveRuleBase(BaseModel):
    min_amount: int
    max_amount: Optional[int] = None
    incentive_percent: float

    @field_validator("min_amount")
    @classmethod
    def min_amount_positive(cls, v):
        if v < 0:
            raise ValueError("min_amount must be >= 0")
        return v

    @field_validator("max_amount")
    @classmethod
    def max_gt_min(cls, v, info):
        min_amount = info.data.get("min_amount")
        if v is not None and min_amount is not None and v <= min_amount:
            raise ValueError("max_amount must be greater than min_amount")
        return v

class IncentiveRuleCreate(IncentiveRuleBase):
    pass

class IncentiveRuleUpdate(IncentiveRuleBase):
    pass

class IncentiveRuleOut(IncentiveRuleBase):
    id: int

    class Config:
        from_attributes = True
