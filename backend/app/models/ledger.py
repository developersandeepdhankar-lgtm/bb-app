from sqlalchemy import Column, Integer, String, DateTime, Numeric
from app.core.database import Base


class Ledger(Base):
    __tablename__ = "ledgers"

    id = Column(Integer, primary_key=True, index=True)
    guid = Column(String(100), unique=True, nullable=False)

    name = Column(String(255))
    parent = Column(String(100))
    group_guid = Column(String(100))
    ledger_group_id = Column(Integer)

    opening_balance = Column(Numeric(15, 2), default=0)
    closing_balance = Column(Numeric(15, 2), default=0)

    gst_type = Column(String(50))
    gstin = Column(String(50))
    mobile = Column(String(15))
    email = Column(String(255))
    address = Column(String)

    pincode = Column(String(10))

    ledger_date_time = Column(DateTime)
    created = Column(DateTime)
    modified = Column(DateTime)
