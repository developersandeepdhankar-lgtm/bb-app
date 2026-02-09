from pydantic import BaseModel, EmailStr
from datetime import datetime

# -------- CREATE USER / SIGNUP --------
class UserCreate(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    password: str
    role_id: int


# -------- RESPONSE --------
class UserResponse(BaseModel):
    id: int
    name: str
    mobile: str
    email: EmailStr
    role_id: int
    created: datetime
    modified: datetime

    class Config:
        from_attributes = True
