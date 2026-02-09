from sqlalchemy import Column, Integer, ForeignKey, Numeric
from app.core.database import Base

class UserStateTarget(Base):
    __tablename__ = "user_state_targets"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)

    target_value = Column(Numeric(15, 2), nullable=False)
