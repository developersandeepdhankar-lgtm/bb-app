from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(50), nullable=False)
    code = Column(String(50), unique=True, nullable=False)

    created = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )
