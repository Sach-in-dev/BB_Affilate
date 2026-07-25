from sqlalchemy import Column, String, Boolean, JSON

from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    name = Column(String, primary_key=True)
    label = Column(String, nullable=False)
    description = Column(String, nullable=True)
    permissions = Column(JSON, default=list, nullable=False)
    is_system = Column(Boolean, default=False, nullable=False)
