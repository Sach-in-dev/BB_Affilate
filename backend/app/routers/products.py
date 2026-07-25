from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.product import Product
from app.models.user import User
from app.routers.auth import get_current_user, require_permission
from app.schemas.catalog import ProductResponse, ProductListResponse, FiltersResponse
from app.services.product_sync import sync_products

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=dict)
async def list_products(
    search: str | None = None,
    brand: str | None = None,
    category: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=60),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Browsable, filterable product list for creators (SOW 3.1 #2 — organised by
    brand, category and tags rather than a flat list)."""
    stmt = select(Product).where(Product.is_affiliate_enabled.is_(True))

    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Product.name).like(like),
                func.lower(Product.brand).like(like),
                func.lower(Product.sku).like(like),
            )
        )
    if brand:
        stmt = stmt.where(Product.brand == brand)
    if category:
        stmt = stmt.where(Product.category == category)

    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = await db.execute(
        stmt.order_by(Product.name).offset((page - 1) * page_size).limit(page_size)
    )
    items = [ProductResponse.model_validate(p).model_dump() for p in rows.scalars().all()]

    return {
        "data": ProductListResponse(
            items=items,
            total=total or 0,
            page=page,
            page_size=page_size,
            pages=max(1, ((total or 0) + page_size - 1) // page_size),
        ).model_dump()
    }


@router.get("/filters", response_model=dict)
async def product_filters(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    brands = await db.execute(
        select(Product.brand).where(Product.brand.isnot(None)).distinct().order_by(Product.brand)
    )
    categories = await db.execute(
        select(Product.category).where(Product.category.isnot(None)).distinct().order_by(Product.category)
    )
    return {
        "data": FiltersResponse(
            brands=[b for b in brands.scalars().all() if b],
            categories=[c for c in categories.scalars().all() if c],
        ).model_dump()
    }


@router.get("/trending", response_model=dict)
async def trending_products(
    limit: int = Query(6, ge=1, le=20),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Discounted, in-stock products surfaced on the creator home."""
    rows = await db.execute(
        select(Product)
        .where(Product.is_affiliate_enabled.is_(True), Product.availability.is_(True))
        .order_by(Product.discount_price.isnot(None).desc(), Product.rating.desc().nullslast())
        .limit(limit)
    )
    return {"data": [ProductResponse.model_validate(p).model_dump() for p in rows.scalars().all()]}


@router.post("/sync", response_model=dict)
async def sync_from_production(
    limit: int = Query(None, ge=1, le=settings.PRODUCT_SYNC_LIMIT),
    _: User = Depends(require_permission("manage_products")),
    db: AsyncSession = Depends(get_db),
):
    """Pull products from the BeautyBarn production DB (read-only) into the master."""
    result = await sync_products(db, limit)
    return {"data": result}
