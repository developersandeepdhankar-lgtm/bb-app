from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from app.core.database import Base

class Voucher(Base):
    __tablename__ = "vouchers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    guid = Column(String(100), unique=True)
    voucher_type = Column(String(100))
    voucher_number = Column(String(50))
    voucher_date = Column(Date)
    narration = Column(Text)

    voucher_ledger_id = Column(Integer)
    voucher_ledger_guid = Column(String(100))

    created = Column(DateTime)
    modified = Column(DateTime)
