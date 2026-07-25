from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.user import User
from app.schemas.auth import SignUpRequest, LoginRequest, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return user


def require_permission(permission: str):
    """Dependency factory: ensure the current user has a given permission."""

    async def checker(user: User = Depends(get_current_user)) -> User:
        perms = user.permissions or []
        if user.user_type != "admin" or permission not in perms:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return checker


@router.post("/signup", response_model=dict)
async def signup(body: SignUpRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Public signup creates a creator (influencer) account.
    user = User(
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        hashed_password=hash_password(body.password),
        phone=body.phone,
        user_type="creator",
        role_name=None,
        permissions=[],
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id})
    return {"data": TokenResponse(token=token, user=UserResponse.model_validate(user)).model_dump()}


@router.post("/login", response_model=dict)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": user.id})
    return {"data": TokenResponse(token=token, user=UserResponse.model_validate(user)).model_dump()}


@router.get("/me", response_model=dict)
async def me(user: User = Depends(get_current_user)):
    return {"data": UserResponse.model_validate(user).model_dump()}


@router.post("/logout")
async def logout():
    return {"message": "Logged out"}
