from sqlalchemy import Column, String, DateTime, Text, func
import uuid

from app.core.database import Base


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    instagram_link = Column(String, nullable=False)
    platforms = Column(Text, nullable=True)
    social_links = Column(Text, nullable=True)
    additional_info = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
