from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    name = Column(String(150), nullable=False)
