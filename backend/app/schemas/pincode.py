from pydantic import BaseModel
from decimal import Decimal

class PincodeBase(BaseModel):
    pincode: str
    office_name: str | None = None
    district_id: int
    latitude: Decimal | None = None
    longitude: Decimal | None = None

class PincodeCreate(PincodeBase):
    pass

class PincodeUpdate(PincodeBase):
    pass

class PincodeOut(PincodeBase):
    id: int

    class Config:
        from_attributes = True
