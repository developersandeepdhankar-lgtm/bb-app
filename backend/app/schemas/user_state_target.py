from pydantic import BaseModel
from decimal import Decimal

class UserStateTargetCreate(BaseModel):
    user_id: int
    state_id: int
    target_value: Decimal

class UserStateTargetOut(UserStateTargetCreate):
    id: int

    class Config:
        from_attributes = True
