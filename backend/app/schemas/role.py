from pydantic import BaseModel

class RoleBase(BaseModel):
    name: str
    code: str

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: int

    class Config:
        from_attributes = True
