from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.banner import Banner
from app.models.user import User
from app.routers.auth import require_permission
from app.schemas.catalog import BannerResponse, BannerUpsertRequest

router = APIRouter(prefix="/admin/banners", tags=["banners"])


@router.get("", response_model=dict)
async def list_banners(
    _: User = Depends(require_permission("manage_banners")),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.execute(select(Banner).order_by(Banner.sort_order))
    return {"data": [BannerResponse.model_validate(b).model_dump() for b in rows.scalars().all()]}


@router.post("", response_model=dict)
async def create_banner(
    body: BannerUpsertRequest,
    _: User = Depends(require_permission("manage_banners")),
    db: AsyncSession = Depends(get_db),
):
    banner = Banner(**body.model_dump())
    db.add(banner)
    await db.commit()
    await db.refresh(banner)
    return {"data": BannerResponse.model_validate(banner).model_dump()}


@router.put("/{banner_id}", response_model=dict)
async def update_banner(
    banner_id: str,
    body: BannerUpsertRequest,
    _: User = Depends(require_permission("manage_banners")),
    db: AsyncSession = Depends(get_db),
):
    banner = await db.get(Banner, banner_id)
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    for field, value in body.model_dump().items():
        setattr(banner, field, value)
    await db.commit()
    await db.refresh(banner)
    return {"data": BannerResponse.model_validate(banner).model_dump()}


@router.delete("/{banner_id}", response_model=dict)
async def delete_banner(
    banner_id: str,
    _: User = Depends(require_permission("manage_banners")),
    db: AsyncSession = Depends(get_db),
):
    banner = await db.get(Banner, banner_id)
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    await db.delete(banner)
    await db.commit()
    return {"data": {"id": banner_id, "deleted": True}}
