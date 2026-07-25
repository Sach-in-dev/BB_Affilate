from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import PERMISSIONS
from app.core.security import hash_password
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
    actor: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db),
):
    if user_id == actor.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    result = await db.execute(select(User).where(User.id == user_id, User.user_type == "admin"))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    await db.delete(user)
    await db.commit()
    return {"data": {"id": user_id, "deleted": True}}
