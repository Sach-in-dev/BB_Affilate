"""Idempotent seeding of default roles and the bootstrap super-admin user."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import DEFAULT_ROLES, DEFAULT_ADMIN
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User


async def seed_defaults(db: AsyncSession) -> None:
    # Seed / refresh system roles.
    for role_def in DEFAULT_ROLES:
        result = await db.execute(select(Role).where(Role.name == role_def["name"]))
        role = result.scalar_one_or_none()
        if role is None:
            db.add(Role(**role_def))
        else:
            # Keep system role permissions in sync with the catalog.
            role.label = role_def["label"]
            role.description = role_def["description"]
            role.permissions = role_def["permissions"]
            role.is_system = role_def["is_system"]
    await db.commit()

    # Seed the bootstrap super-admin if it does not exist.
    result = await db.execute(select(User).where(User.email == DEFAULT_ADMIN["email"]))
    if result.scalar_one_or_none() is None:
        role_result = await db.execute(select(Role).where(Role.name == DEFAULT_ADMIN["role_name"]))
        role = role_result.scalar_one()
        db.add(
            User(
                first_name=DEFAULT_ADMIN["first_name"],
                last_name=DEFAULT_ADMIN["last_name"],
                email=DEFAULT_ADMIN["email"],
                hashed_password=hash_password(DEFAULT_ADMIN["password"]),
                user_type="admin",
                role_name=role.name,
                permissions=list(role.permissions),
                is_active=True,
            )
        )
        await db.commit()
