from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL
from app.core.database import Base

class Pincode(Base):
    __tablename__ = "pincodes"

    id = Column(Integer, primary_key=True)
    pincode = Column(String(6), index=True)
    office_name = Column(String(200))
    district_id = Column(Integer, ForeignKey("districts.id"))
    latitude = Column(DECIMAL(10,7))
    longitude = Column(DECIMAL(10,7))