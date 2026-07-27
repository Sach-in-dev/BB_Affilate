from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserListParams(BaseModel):
    page: int = 1
    page_size: int = 20
    search: str | None = None
    role_filter: str | None = None  # "creator" or "admin"
    approval_status: str | None = None
    account_status: str | None = None
    date_from: str | None = None
    date_to: str | None = None


class ManagedUserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: str | None = None
    user_type: str
    role_name: str | None = None
    permissions: list[str] = []
    is_active: bool = True
    account_status: str = "active"
    approval_status: str = "approved"
    rejection_reason: str | None = None
    approved_at: datetime | None = None
    approved_by: str | None = None
    is_deleted: bool = False
    deleted_at: datetime | None = None
    last_login_at: datetime | None = None
    handle: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    instagram: str | None = None
    youtube: str | None = None
    niche: str | None = None
    city: str | None = None
    state: str | None = None
    follower_count: str | None = None
    payout_upi: str | None = None
    payout_bank_name: str | None = None
    payout_account_number: str | None = None
    payout_ifsc: str | None = None
    documents: list = []
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: list[ManagedUserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class UpdateUserRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    handle: str | None = None
    bio: str | None = None
    instagram: str | None = None
    youtube: str | None = None
    niche: str | None = None
    city: str | None = None
    state: str | None = None
    follower_count: str | None = None
    payout_upi: str | None = None
    payout_bank_name: str | None = None
    payout_account_number: str | None = None
    payout_ifsc: str | None = None


class StatusChangeRequest(BaseModel):
    account_status: str  # "active", "inactive", "suspended"


class ApprovalRequest(BaseModel):
    action: str  # "approve" or "reject"
    reason: str | None = None


class BulkActionRequest(BaseModel):
    user_ids: list[str]
    action: str  # "approve", "reject", "activate", "deactivate", "suspend", "delete"
    reason: str | None = None


class StatsResponse(BaseModel):
    total_users: int
    pending_approvals: int
    approved_creators: int
    active_users: int
    suspended_users: int
    rejected_users: int


class ActivityLogResponse(BaseModel):
    id: str
    user_id: str
    actor_id: str | None = None
    action: str
    details: dict | None = None
    ip_address: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True
