"""Admin product catalog — browse, search, filter, and manage product status."""
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.product import Product
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/admin/products", tags=["admin-products"])


@router.get("", response_model=dict)
async def list_products(
    search: str | None = None,
    brand: str | None = None,
    category: str | None = None,
    status: str | None = None,
    availability: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    stmt = select(Product)

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
    if status:
        stmt = stmt.where(Product.status == status)
    if availability is not None:
        stmt = stmt.where(Product.availability == availability)

    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = await db.execute(
        stmt.order_by(Product.name).offset((page - 1) * page_size).limit(page_size)
    )
    products = []
    for p in rows.scalars().all():
        products.append({
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "price": p.price,
            "discount_price": p.discount_price,
            "image": p.image,
            "product_url": p.product_url,
            "sku": p.sku,
            "status": p.status,
            "availability": p.availability,
            "tags": p.tags or [],
            "rating": p.rating,
            "is_affiliate_enabled": p.is_affiliate_enabled,
            "synced_at": p.synced_at.isoformat() if p.synced_at else None,
        })

    total = total or 0
    return {
        "data": {
            "products": products,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
        }
    }


@router.get("/stats", response_model=dict)
async def product_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    total = await db.scalar(select(func.count(Product.id))) or 0
    active = await db.scalar(select(func.count(Product.id)).where(Product.status == "ACTIVE")) or 0
    in_stock = await db.scalar(select(func.count(Product.id)).where(Product.availability.is_(True))) or 0
    affiliate_enabled = await db.scalar(select(func.count(Product.id)).where(Product.is_affiliate_enabled.is_(True))) or 0

    brands = await db.execute(
        select(Product.brand).where(Product.brand.isnot(None)).distinct().order_by(Product.brand)
    )
    categories = await db.execute(
        select(Product.category).where(Product.category.isnot(None)).distinct().order_by(Product.category)
    )

    return {
        "data": {
            "total": total,
            "active": active,
            "in_stock": in_stock,
            "out_of_stock": total - in_stock,
            "affiliate_enabled": affiliate_enabled,
            "brands": [b for b in brands.scalars().all() if b],
            "categories": [c for c in categories.scalars().all() if c],
        }
    }


@router.get("/export")
async def export_products(
    search: str | None = None,
    brand: str | None = None,
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    stmt = select(Product)
    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(or_(func.lower(Product.name).like(like), func.lower(Product.brand).like(like)))
    if brand:
        stmt = stmt.where(Product.brand == brand)
    if category:
        stmt = stmt.where(Product.category == category)

    rows = await db.scalars(stmt.order_by(Product.name))

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Name", "Brand", "Category", "SKU", "Price", "Discount Price", "Status", "In Stock", "Affiliate Enabled", "Rating", "Product URL"])
    for p in rows.all():
        writer.writerow([
            p.name, p.brand or "", p.category or "", p.sku or "",
            p.price or "", p.discount_price or "", p.status,
            "Yes" if p.availability else "No",
            "Yes" if p.is_affiliate_enabled else "No",
            p.rating or "", p.product_url,
        ])

    buf.seek(0)
    return StreamingResponse(buf, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=products_export.csv"})


@router.patch("/{product_id}", response_model=dict)
async def update_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    is_affiliate_enabled: bool | None = None,
    status: str | None = None,
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if is_affiliate_enabled is not None:
        product.is_affiliate_enabled = is_affiliate_enabled
    if status is not None:
        product.status = status

    await db.commit()
    await db.refresh(product)
    return {"data": {"message": "Product updated"}}
