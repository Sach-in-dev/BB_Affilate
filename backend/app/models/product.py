from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, Float, func

from app.core.database import Base


class Product(Base):
    """Affiliate product master — a local, read-only-sourced copy of BeautyBarn products.

    `id` mirrors the production product id so links stay stable across syncs.
    Prices are stored in whole rupees, matching the production schema.
    """

    __tablename__ = "products"

    id = Column(String, primary_key=True)  # production product.id
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True, index=True)
    category = Column(String, nullable=True, index=True)

    price = Column(Integer, nullable=True)           # MRP
    discount_price = Column(Integer, nullable=True)  # special price, null when not discounted

    image = Column(String, nullable=True)
    product_url = Column(String, nullable=False)
    sku = Column(String, nullable=True)

    status = Column(String, default="ACTIVE", nullable=False)
    availability = Column(Boolean, default=True, nullable=False)
    tags = Column(JSON, default=list, nullable=False)

    handle = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    is_affiliate_enabled = Column(Boolean, default=True, nullable=False)

    synced_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
