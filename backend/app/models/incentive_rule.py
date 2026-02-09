from sqlalchemy import Column, Integer, String, TIMESTAMP,DECIMAL
from sqlalchemy.sql import func
from app.core.database import Base
class IncentiveRule(Base):
    __tablename__ = "incentive_rules"

    id = Column(Integer, primary_key=True, index=True)
    min_amount = Column(Integer, nullable=False)
    max_amount = Column(Integer, nullable=True)
    incentive_percent = Column(DECIMAL(5, 2), nullable=False)
