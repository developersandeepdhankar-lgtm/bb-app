from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)

    # 🔥 TOTAL TARGET
    target = Column(Integer, default=0)
    is_target = Column(Integer, default=0)

    svg_path = Column(Text, nullable=True)
    label_x = Column(Integer, nullable=True)
    label_y = Column(Integer, nullable=True)
