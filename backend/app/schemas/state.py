from pydantic import BaseModel
from typing import Optional

# ---------------- BASE ----------------
class StateBase(BaseModel):
    name: str


# ---------------- CREATE ----------------
class StateCreate(StateBase):
    target: Optional[int] = None
    is_target: Optional[int] = 0
    svg_path: Optional[str] = None

    # 🔥 MUST BE FLOAT
    label_x: Optional[float] = None
    label_y: Optional[float] = None


# ---------------- UPDATE ----------------
class StateUpdate(BaseModel):
    name: Optional[str] = None
    target: Optional[int] = None
    is_target: Optional[int] = None
    svg_path: Optional[str] = None

    # 🔥 MUST BE FLOAT
    label_x: Optional[float] = None
    label_y: Optional[float] = None


# ---------------- RESPONSE ----------------
class StateOut(BaseModel):
    id: int
    name: str
    target: Optional[int]
    is_target: int
    svg_path: Optional[str]

    # 🔥 MUST BE FLOAT
    label_x: Optional[float]
    label_y: Optional[float]

    class Config:
        from_attributes = True   # SQLAlchemy → Pydantic
