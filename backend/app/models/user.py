from sqlalchemy import Column, String, DateTime, Boolean, JSON, ForeignKey, Text, func
import uuid

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)

    # "admin" (BeautyBarn staff / merchant) or "creator" (influencer)
    user_type = Column(String, default="creator", nullable=False)
    # Role name for admin users; null for creators
    role_name = Column(String, ForeignKey("roles.name"), nullable=True)
    # Effective permission keys for this user (seeded from the role, editable per user)
    permissions = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # ── Account & Approval Status ──
    # account_status: "active", "inactive", "suspended"
    account_status = Column(String, default="active", nullable=False)
    # approval_status: "pending", "approved", "rejected" (for creators)
    approval_status = Column(String, default="approved", nullable=False)
    rejection_reason = Column(Text, nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(String, nullable=True)

    # ── Soft delete ──
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # ── Timestamps ──
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # ── Creator profile (drives the public bundle landing page) ──
    handle = Column(String, unique=True, nullable=True, index=True)  # e.g. "kinnarijain"
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    youtube = Column(String, nullable=True)
    niche = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)

    # ── Creator onboarding extras ──
    follower_count = Column(String, nullable=True)
    payout_upi = Column(String, nullable=True)
    payout_bank_name = Column(String, nullable=True)
    payout_account_number = Column(String, nullable=True)
    payout_ifsc = Column(String, nullable=True)
    documents = Column(JSON, default=list, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
