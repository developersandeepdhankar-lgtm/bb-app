from pydantic import BaseModel
from datetime import datetime

class CostCenterUserMapCreate(BaseModel):
    user_id: int
    cost_centre: str   # 🔥 NAME, NOT ID

class CostCenterUserMapOut(CostCenterUserMapCreate):
    id: int
    created: datetime

    class Config:
        from_attributes = True
