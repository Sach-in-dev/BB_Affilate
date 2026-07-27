import csv
import io
import math
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.routers.auth import require_permission
from app.schemas.user_management import (
    ManagedUserResponse,
    UserListResponse,
    UpdateUserRequest,
    StatusChangeRequest,
    ApprovalRequest,
    BulkActionRequest,
    StatsResponse,
    ActivityLogResponse,
)

router = APIRouter(prefix="/admin/creator-management", tags=["creator-management"])


async def _log_activity(
    db: AsyncSession,
    user_id: str,
    actor_id: str,
    action: str,
    details: dict | None = None,
    ip_address: str | None = None,
):
    log = ActivityLog(
        user_id=user_id,
        actor_id=actor_id,
        action=action,
        details=details,
        ip_address=ip_address,
    )
    db.add(log)


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


@router.get("/stats", response_model=dict)
async def get_stats(
    _: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    base = select(User).where(User.is_deleted == False, User.user_type == "creator")

    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0
    pending = (await db.execute(
        select(func.count()).select_from(
            base.where(User.approval_status == "pending").subquery()
        )
    )).scalar() or 0
    approved = (await db.execute(
        select(func.count()).select_from(
            base.where(User.approval_status == "approved").subquery()
        )
    )).scalar() or 0
    active = (await db.execute(
        select(func.count()).select_from(
            base.where(User.account_status == "active").subquery()
        )
    )).scalar() or 0
    suspended = (await db.execute(
        select(func.count()).select_from(
            base.where(User.account_status == "suspended").subquery()
        )
    )).scalar() or 0
    rejected = (await db.execute(
        select(func.count()).select_from(
            base.where(User.approval_status == "rejected").subquery()
        )
    )).scalar() or 0

    stats = StatsResponse(
        total_users=total,
        pending_approvals=pending,
        approved_creators=approved,
        active_users=active,
        suspended_users=suspended,
        rejected_users=rejected,
    )
    return {"data": stats.model_dump()}


@router.get("/users", response_model=dict)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    approval_status: str | None = Query(None),
    account_status: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    include_deleted: bool = Query(False),
    _: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    conditions = [User.user_type == "creator"]
    if not include_deleted:
        conditions.append(User.is_deleted == False)

    if search:
        term = f"%{search}%"
        conditions.append(
            or_(
                User.first_name.ilike(term),
                User.last_name.ilike(term),
                User.email.ilike(term),
            )
        )

    if approval_status:
        conditions.append(User.approval_status == approval_status)

    if account_status:
        conditions.append(User.account_status == account_status)

    if date_from:
        conditions.append(User.created_at >= date_from)

    if date_to:
        conditions.append(User.created_at <= date_to + "T23:59:59")

    where_clause = and_(*conditions) if conditions else True

    total = (await db.execute(
        select(func.count()).select_from(select(User).where(where_clause).subquery())
    )).scalar() or 0

    offset = (page - 1) * page_size
    result = await db.execute(
        select(User)
        .where(where_clause)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    users = result.scalars().all()

    resp = UserListResponse(
        users=[ManagedUserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1,
    )
    return {"data": resp.model_dump()}


@router.get("/users/{user_id}", response_model=dict)
async def get_user(
    user_id: str,
    _: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_user(db, user_id)
    return {"data": ManagedUserResponse.model_validate(user).model_dump()}


@router.put("/users/{user_id}", response_model=dict)
async def update_user(
    user_id: str,
    body: UpdateUserRequest,
    request: Request,
    actor: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_user(db, user_id)

    nullable_fields = {"handle", "bio", "instagram", "youtube", "niche", "city", "state",
                       "follower_count", "payout_upi", "payout_bank_name", "payout_account_number", "payout_ifsc", "phone"}
    changes = {}
    for field, value in body.model_dump(exclude_unset=True).items():
        if value is not None:
            if field in nullable_fields and value == "":
                value = None
            if getattr(user, field) != value:
                changes[field] = {"from": getattr(user, field), "to": value}
                setattr(user, field, value)

    if changes:
        await _log_activity(db, user_id, actor.id, "user_edited", changes, _client_ip(request))
        await db.commit()
        await db.refresh(user)

    return {"data": ManagedUserResponse.model_validate(user).model_dump()}


@router.post("/users/{user_id}/status", response_model=dict)
async def change_status(
    user_id: str,
    body: StatusChangeRequest,
    request: Request,
    actor: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    if body.account_status not in ("active", "inactive", "suspended"):
        raise HTTPException(status_code=400, detail="Invalid status")

    user = await _get_user(db, user_id)
    old_status = user.account_status
    user.account_status = body.account_status
    user.is_active = body.account_status == "active"

    from app.models.affiliate import AffiliateLink
    links_active = body.account_status == "active"
    await db.execute(
        AffiliateLink.__table__.update()
        .where(AffiliateLink.creator_id == user_id)
        .values(is_active=links_active)
    )

    await _log_activity(
        db, user_id, actor.id, "status_changed",
        {"from": old_status, "to": body.account_status, "links_active": links_active},
        _client_ip(request),
    )
    await db.commit()
    await db.refresh(user)
    return {"data": ManagedUserResponse.model_validate(user).model_dump()}


@router.post("/users/{user_id}/approval", response_model=dict)
async def handle_approval(
    user_id: str,
    body: ApprovalRequest,
    request: Request,
    actor: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    if body.action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")

    user = await _get_user(db, user_id)

    if body.action == "approve":
        user.approval_status = "approved"
        user.rejection_reason = None
        user.approved_at = datetime.now(timezone.utc)
        user.approved_by = actor.id
    else:
        if not body.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        user.approval_status = "rejected"
        user.rejection_reason = body.reason
        user.approved_at = None
        user.approved_by = None

    await _log_activity(
        db, user_id, actor.id, f"user_{body.action}d",
        {"reason": body.reason} if body.reason else None,
        _client_ip(request),
    )
    await db.commit()
    await db.refresh(user)
    return {"data": ManagedUserResponse.model_validate(user).model_dump()}


@router.delete("/users/{user_id}", response_model=dict)
async def soft_delete_user(
    user_id: str,
    request: Request,
    actor: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    if user_id == actor.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    user = await _get_user(db, user_id)
    user.is_deleted = True
    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False

    await _log_activity(db, user_id, actor.id, "user_deleted", None, _client_ip(request))
    await db.commit()
    return {"data": {"id": user_id, "deleted": True}}


@router.post("/users/{user_id}/restore", response_model=dict)
async def restore_user(
    user_id: str,
    request: Request,
    actor: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_deleted = False
    user.deleted_at = None
    user.is_active = True
    user.account_status = "active"

    await _log_activity(db, user_id, actor.id, "user_restored", None, _client_ip(request))
    await db.commit()
    await db.refresh(user)
    return {"data": ManagedUserResponse.model_validate(user).model_dump()}


@router.post("/bulk", response_model=dict)
async def bulk_action(
    body: BulkActionRequest,
    request: Request,
    actor: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    valid_actions = ("approve", "reject", "activate", "deactivate", "suspend", "delete")
    if body.action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Must be one of: {valid_actions}")

    if body.action == "reject" and not body.reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")

    result = await db.execute(select(User).where(User.id.in_(body.user_ids)))
    users = result.scalars().all()

    processed = 0
    for user in users:
        if user.id == actor.id:
            continue

        if body.action == "approve":
            user.approval_status = "approved"
            user.rejection_reason = None
            user.approved_at = datetime.now(timezone.utc)
            user.approved_by = actor.id
        elif body.action == "reject":
            user.approval_status = "rejected"
            user.rejection_reason = body.reason
        elif body.action == "activate":
            user.account_status = "active"
            user.is_active = True
        elif body.action == "deactivate":
            user.account_status = "inactive"
            user.is_active = False
        elif body.action == "suspend":
            user.account_status = "suspended"
            user.is_active = False
        elif body.action == "delete":
            user.is_deleted = True
            user.deleted_at = datetime.now(timezone.utc)
            user.is_active = False

        await _log_activity(
            db, user.id, actor.id, f"bulk_{body.action}",
            {"reason": body.reason} if body.reason else None,
            _client_ip(request),
        )
        processed += 1

    await db.commit()
    return {"data": {"processed": processed, "action": body.action}}


@router.get("/users/{user_id}/activity", response_model=dict)
async def get_user_activity(
    user_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(
        select(func.count()).where(ActivityLog.user_id == user_id)
    )).scalar() or 0

    offset = (page - 1) * page_size
    result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    logs = result.scalars().all()

    return {
        "data": {
            "logs": [ActivityLogResponse.model_validate(l).model_dump() for l in logs],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    }


@router.get("/export")
async def export_users(
    search: str | None = Query(None),
    approval_status: str | None = Query(None),
    account_status: str | None = Query(None),
    _: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    conditions = [User.is_deleted == False, User.user_type == "creator"]

    if search:
        term = f"%{search}%"
        conditions.append(
            or_(User.first_name.ilike(term), User.last_name.ilike(term), User.email.ilike(term))
        )
    if approval_status:
        conditions.append(User.approval_status == approval_status)
    if account_status:
        conditions.append(User.account_status == account_status)

    result = await db.execute(
        select(User).where(and_(*conditions)).order_by(User.created_at.desc())
    )
    users = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Name", "Email", "Phone", "Type", "Role", "Account Status",
        "Approval Status", "Handle", "Niche", "City", "State",
        "Instagram", "YouTube", "Registered", "Last Login",
    ])
    for u in users:
        writer.writerow([
            f"{u.first_name} {u.last_name}",
            u.email,
            u.phone or "",
            u.user_type,
            u.role_name or "creator",
            u.account_status,
            u.approval_status,
            u.handle or "",
            u.niche or "",
            u.city or "",
            u.state or "",
            u.instagram or "",
            u.youtube or "",
            str(u.created_at or ""),
            str(u.last_login_at or ""),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=creators_export.csv"},
    )


async def _get_user(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/creators", response_model=dict)
async def create_creator(
    request: Request,
    actor: User = Depends(require_permission("manage_creators")),
    db: AsyncSession = Depends(get_db),
):
    from pydantic import BaseModel, EmailStr
    from app.core.security import hash_password

    class CreateCreatorRequest(BaseModel):
        first_name: str
        last_name: str
        email: EmailStr
        password: str
        phone: str | None = None
        handle: str | None = None
        instagram: str | None = None
        youtube: str | None = None
        niche: str | None = None
        city: str | None = None
        state: str | None = None
        approval_status: str = "approved"

    body = CreateCreatorRequest(**(await request.json()))

    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    if body.handle:
        existing_handle = await db.execute(select(User).where(User.handle == body.handle))
        if existing_handle.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Handle already taken")

    user = User(
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        hashed_password=hash_password(body.password),
        phone=body.phone or None,
        user_type="creator",
        role_name=None,
        permissions=[],
        handle=body.handle or None,
        instagram=body.instagram or None,
        youtube=body.youtube or None,
        niche=body.niche or None,
        city=body.city or None,
        state=body.state or None,
        approval_status=body.approval_status,
        account_status="active",
    )
    db.add(user)
    await db.flush()
    await _log_activity(db, user.id, actor.id, "creator_created", None, _client_ip(request))
    await db.commit()
    await db.refresh(user)
    return {"data": ManagedUserResponse.model_validate(user).model_dump()}
