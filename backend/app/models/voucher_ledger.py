from sqlalchemy import Column, Integer, String, Numeric, DateTime
from app.core.database import Base

class VoucherLedger(Base):
    __tablename__ = "voucher_ledgers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    guid = Column(String(100))
    ledger_id = Column(Integer)
    ledger_guid = Column(String(100))
    ledger_name = Column(String(255))
    amount = Column(Numeric(15, 2))

    created = Column(DateTime)
    modified = Column(DateTime)
    line_no = Column(Integer)
