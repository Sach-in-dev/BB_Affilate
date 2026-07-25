from sqlalchemy import Column, String, Integer, Boolean, DateTime, func
import uuid

from app.core.database import Base


class Banner(Base):
    """Admin-managed promotional banner slot shown in the influencer dashboard (SOW 3.4).

    Admin sets the creative and destination link; no developer involvement needed.
    """

    __tablename__ = "banners"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    destination_url = Column(String, nullable=True)
    slot = Column(String, default="dashboard_top", nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
