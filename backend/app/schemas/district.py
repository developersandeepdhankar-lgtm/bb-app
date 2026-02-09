from pydantic import BaseModel

class DistrictBase(BaseModel):
    name: str
    state_id: int

class DistrictCreate(DistrictBase):
    pass

class DistrictUpdate(DistrictBase):
    pass

class DistrictOut(DistrictBase):
    id: int

    class Config:
        from_attributes = True
