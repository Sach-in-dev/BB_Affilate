import math

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import PERMISSIONS
from app.core.security import hash_password
from app.models.activity_log import ActivityLog
from app.models.role import Role
from app.models.user import User
from app.routers.auth import require_permission
from app.schemas.admin import (
    RoleResponse,
    CreateRoleRequest,
    UpdateRoleRequest,
    PermissionResponse,
    AdminUserResponse,
    CreateAdminUserRequest,
    UpdateAdminUserRequest,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/permissions", response_model=dict)
async def list_permissions(_: User = Depends(require_permission("manage_users"))):
    return {"data": [PermissionResponse(**p).model_dump() for p in PERMISSIONS]}


@router.get("/roles", response_model=dict)
async def list_roles(
    _: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Role))
    roles = result.scalars().all()
    return {"data": [RoleResponse.model_validate(r).model_dump() for r in roles]}


@router.post("/roles", response_model=dict)
async def create_role(
    body: CreateRoleRequest,
    _: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Role).where(Role.name == body.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Role name already exists")
    
    role = Role(
        name=body.name,
        label=body.label,
        description=body.description,
        permissions=body.permissions,
        is_system=False,
    )
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return {"data": RoleResponse.model_validate(role).model_dump()}


@router.put("/roles/{role_name}", response_model=dict)
async def update_role(
    role_name: str,
    body: UpdateRoleRequest,
    _: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    role = await _get_role(db, role_name)
    if role.is_system:
        raise HTTPException(status_code=400, detail="Cannot edit system roles")
    
    if body.label is not None:
        role.label = body.label
    if body.description is not None:
        role.description = body.description
    if body.permissions is not None:
        role.permissions = body.permissions
        
        # Sync permissions to all users with this role
        result = await db.execute(select(User).where(User.role_name == role.name))
        for user in result.scalars().all():
            user.permissions = body.permissions

    await db.commit()
    await db.refresh(role)
    return {"data": RoleResponse.model_validate(role).model_dump()}


@router.delete("/roles/{role_name}", response_model=dict)
async def delete_role(
    role_name: str,
    _: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    role = await _get_role(db, role_name)
    if role.is_system:
        raise HTTPException(status_code=400, detail="Cannot delete system roles")
    
    users_with_role = await db.execute(select(User).where(User.role_name == role_name))
    if users_with_role.scalars().first():
        raise HTTPException(status_code=400, detail="Cannot delete a role that is assigned to users")
    
    await db.delete(role)
    await db.commit()
    return {"data": {"name": role_name, "deleted": True}}


@router.get("/users", response_model=dict)
async def list_admin_users(
    _: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.user_type == "admin").order_by(User.created_at))
    users = result.scalars().all()
    return {"data": [AdminUserResponse.model_validate(u).model_dump() for u in users]}


async def _get_role(db: AsyncSession, role_name: str) -> Role:
    result = await db.execute(select(Role).where(Role.name == role_name))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=400, detail=f"Unknown role: {role_name}")
    return role


@router.post("/users", response_model=dict)
async def create_admin_user(
    body: CreateAdminUserRequest,
    _: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    role = await _get_role(db, body.role_name)
    permissions = list(role.permissions)

    user = User(
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        hashed_password=hash_password(body.password),
        phone=body.phone,
        user_type="admin",
        role_name=role.name,
        permissions=permissions,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"data": AdminUserResponse.model_validate(user).model_dump()}


@router.put("/users/{user_id}", response_model=dict)
async def update_admin_user(
    user_id: str,
    body: UpdateAdminUserRequest,
    actor: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id, User.user_type == "admin"))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")

    if body.first_name is not None:
        user.first_name = body.first_name
    if body.last_name is not None:
        user.last_name = body.last_name
    if body.phone is not None:
        user.phone = body.phone
    if body.role_name is not None:
        role = await _get_role(db, body.role_name)
        user.role_name = role.name
        user.permissions = list(role.permissions)
    if body.is_active is not None:
        if user.id == actor.id and body.is_active is False:
            raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
        user.is_active = body.is_active
    if body.password:
        user.hashed_password = hash_password(body.password)

    await db.commit()
    await db.refresh(user)
    return {"data": AdminUserResponse.model_validate(user).model_dump()}


@router.delete("/users/{user_id}", response_model=dict)
async def delete_admin_user(
    user_id: str,
    request: Request,
    actor: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    if user_id == actor.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    result = await db.execute(select(User).where(User.id == user_id, User.user_type == "admin"))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    user.is_deleted = True
    user.is_active = False
    from datetime import datetime, timezone
    user.deleted_at = datetime.now(timezone.utc)
    await _log_admin_activity(db, user_id, actor.id, "admin_deleted", None, _admin_client_ip(request))
    await db.commit()
    return {"data": {"id": user_id, "deleted": True}}


def _admin_client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


async def _log_admin_activity(
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


@router.get("/users-list", response_model=dict)
async def list_admin_users_paginated(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    role_filter: str | None = Query(None),
    account_status: str | None = Query(None),
    include_deleted: bool = Query(False),
    _: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    conditions = [User.user_type == "admin"]
    if not include_deleted:
        conditions.append(User.is_deleted == False)

    if search:
        term = f"%{search}%"
        conditions.append(
            or_(User.first_name.ilike(term), User.last_name.ilike(term), User.email.ilike(term))
        )
    if role_filter:
        conditions.append(User.role_name == role_filter)
    if account_status:
        conditions.append(User.account_status == account_status)

    where_clause = and_(*conditions)
    total = (await db.execute(
        select(func.count()).select_from(select(User).where(where_clause).subquery())
    )).scalar() or 0

    offset = (page - 1) * page_size
    result = await db.execute(
        select(User).where(where_clause).order_by(User.created_at.desc()).offset(offset).limit(page_size)
    )
    users = result.scalars().all()

    from app.schemas.user_management import ManagedUserResponse
    return {
        "data": {
            "users": [ManagedUserResponse.model_validate(u).model_dump() for u in users],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": math.ceil(total / page_size) if total > 0 else 1,
        }
    }


@router.get("/users-stats", response_model=dict)
async def get_admin_stats(
    _: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    base = select(User).where(User.is_deleted == False, User.user_type == "admin")

    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0
    active = (await db.execute(
        select(func.count()).select_from(base.where(User.account_status == "active").subquery())
    )).scalar() or 0
    inactive = (await db.execute(
        select(func.count()).select_from(base.where(User.account_status != "active").subquery())
    )).scalar() or 0

    return {"data": {"total_admins": total, "active_admins": active, "inactive_admins": inactive}}


@router.post("/users/{user_id}/status", response_model=dict)
async def change_admin_status(
    user_id: str,
    request: Request,
    actor: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    raw = await request.json()
    account_status = raw.get("account_status", "")

    if account_status not in ("active", "inactive", "suspended"):
        raise HTTPException(status_code=400, detail="Invalid status")
    if user_id == actor.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status")

    result = await db.execute(select(User).where(User.id == user_id, User.user_type == "admin"))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")

    old_status = user.account_status
    user.account_status = account_status
    user.is_active = account_status == "active"

    await _log_admin_activity(
        db, user_id, actor.id, "admin_status_changed",
        {"from": old_status, "to": account_status},
        _admin_client_ip(request),
    )
    await db.commit()
    await db.refresh(user)
    return {"data": AdminUserResponse.model_validate(user).model_dump()}


@router.post("/users/{user_id}/restore", response_model=dict)
async def restore_admin_user(
    user_id: str,
    request: Request,
    actor: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id, User.user_type == "admin"))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")

    user.is_deleted = False
    user.deleted_at = None
    user.is_active = True
    user.account_status = "active"

    await _log_admin_activity(db, user_id, actor.id, "admin_restored", None, _admin_client_ip(request))
    await db.commit()
    await db.refresh(user)
    return {"data": AdminUserResponse.model_validate(user).model_dump()}


@router.get("/users/{user_id}/activity", response_model=dict)
async def get_admin_user_activity(
    user_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _: User = Depends(require_permission("manage_users")),
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

    from app.schemas.user_management import ActivityLogResponse
    return {
        "data": {
            "logs": [ActivityLogResponse.model_validate(l).model_dump() for l in logs],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    }
