"""Admin link tracking & click analytics."""
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, desc, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.affiliate import AffiliateLink, AffiliateLinkItem, LinkClick
from app.models.product import Product
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.links import public_url

router = APIRouter(prefix="/admin/links", tags=["admin-links"])


@router.get("", response_model=dict)
async def list_links(
    search: str | None = None,
    creator_id: str | None = None,
    link_type: str | None = None,
    is_active: bool | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    stmt = select(AffiliateLink)

    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(
            func.lower(AffiliateLink.code).like(like)
            | func.lower(AffiliateLink.title).like(like)
        )
    if creator_id:
        stmt = stmt.where(AffiliateLink.creator_id == creator_id)
    if link_type:
        stmt = stmt.where(AffiliateLink.link_type == link_type)
    if is_active is not None:
        stmt = stmt.where(AffiliateLink.is_active == is_active)
    if date_from:
        stmt = stmt.where(cast(AffiliateLink.created_at, Date) >= date_from)
    if date_to:
        stmt = stmt.where(cast(AffiliateLink.created_at, Date) <= date_to)

    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = await db.scalars(
        stmt.order_by(desc(AffiliateLink.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    links = []
    for link in rows.all():
        creator = await db.get(User, link.creator_id)
        products = []
        for item in link.items:
            if item.product:
                products.append({
                    "id": item.product.id,
                    "name": item.product.name,
                    "brand": item.product.brand,
                    "image": item.product.image,
                    "clicks": item.clicks,
                })

        links.append({
            "id": link.id,
            "code": link.code,
            "link_type": link.link_type,
            "title": link.title,
            "url": public_url(link.code),
            "is_active": link.is_active,
            "total_clicks": link.total_clicks,
            "total_orders": link.total_orders,
            "total_commission": link.total_commission,
            "creator": {
                "id": creator.id,
                "name": f"{creator.first_name} {creator.last_name}",
                "email": creator.email,
                "handle": creator.handle,
            } if creator else None,
            "products": products,
            "created_at": link.created_at.isoformat() if link.created_at else None,
        })

    total = total or 0
    return {
        "data": {
            "links": links,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
        }
    }


@router.get("/stats", response_model=dict)
async def link_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    total_links = await db.scalar(select(func.count(AffiliateLink.id))) or 0
    active_links = await db.scalar(select(func.count(AffiliateLink.id)).where(AffiliateLink.is_active.is_(True))) or 0
    single_links = await db.scalar(select(func.count(AffiliateLink.id)).where(AffiliateLink.link_type == "single")) or 0
    bundle_links = await db.scalar(select(func.count(AffiliateLink.id)).where(AffiliateLink.link_type == "bundle")) or 0
    total_clicks = await db.scalar(select(func.count(LinkClick.id))) or 0
    unique_clicks = await db.scalar(select(func.count(func.distinct(LinkClick.ip_address)))) or 0

    top_sources_rows = await db.execute(
        select(LinkClick.source, func.count(LinkClick.id).label("count"))
        .where(LinkClick.source.isnot(None))
        .group_by(LinkClick.source)
        .order_by(desc("count"))
        .limit(5)
    )
    top_sources = [{"source": r[0], "count": r[1]} for r in top_sources_rows.all()]

    clicks_by_day_rows = await db.execute(
        select(
            cast(LinkClick.clicked_at, Date).label("date"),
            func.count(LinkClick.id).label("clicks"),
        )
        .group_by("date")
        .order_by(desc("date"))
        .limit(30)
    )
    clicks_by_day = [{"date": str(r[0]), "clicks": r[1]} for r in clicks_by_day_rows.all()]
    clicks_by_day.reverse()

    return {
        "data": {
            "total_links": total_links,
            "active_links": active_links,
            "inactive_links": total_links - active_links,
            "single_links": single_links,
            "bundle_links": bundle_links,
            "total_clicks": total_clicks,
            "unique_clicks": unique_clicks,
            "top_sources": top_sources,
            "clicks_by_day": clicks_by_day,
        }
    }


@router.get("/clicks", response_model=dict)
async def list_clicks(
    link_id: str | None = None,
    creator_id: str | None = None,
    source: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    stmt = select(LinkClick)
    if link_id:
        stmt = stmt.where(LinkClick.link_id == link_id)
    if creator_id:
        stmt = stmt.where(LinkClick.creator_id == creator_id)
    if source:
        stmt = stmt.where(LinkClick.source == source)
    if date_from:
        stmt = stmt.where(cast(LinkClick.clicked_at, Date) >= date_from)
    if date_to:
        stmt = stmt.where(cast(LinkClick.clicked_at, Date) <= date_to)

    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = await db.scalars(
        stmt.order_by(desc(LinkClick.clicked_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    clicks = []
    for c in rows.all():
        clicks.append({
            "id": c.id,
            "link_id": c.link_id,
            "code": c.code,
            "creator_id": c.creator_id,
            "product_id": c.product_id,
            "source": c.source,
            "referrer": c.referrer,
            "ip_address": c.ip_address,
            "clicked_at": c.clicked_at.isoformat() if c.clicked_at else None,
        })

    total = total or 0
    return {
        "data": {
            "clicks": clicks,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
        }
    }


@router.get("/export")
async def export_links(
    search: str | None = None,
    creator_id: str | None = None,
    link_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    stmt = select(AffiliateLink)
    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(func.lower(AffiliateLink.code).like(like) | func.lower(AffiliateLink.title).like(like))
    if creator_id:
        stmt = stmt.where(AffiliateLink.creator_id == creator_id)
    if link_type:
        stmt = stmt.where(AffiliateLink.link_type == link_type)

    rows = await db.scalars(stmt.order_by(desc(AffiliateLink.created_at)))

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Code", "Type", "Title", "URL", "Creator", "Products", "Clicks", "Orders", "Commission", "Active", "Created"])

    for link in rows.all():
        creator = await db.get(User, link.creator_id)
        creator_name = f"{creator.first_name} {creator.last_name}" if creator else ""
        product_names = "; ".join(item.product.name for item in link.items if item.product)
        writer.writerow([
            link.code, link.link_type, link.title or "",
            public_url(link.code), creator_name, product_names,
            link.total_clicks, link.total_orders, link.total_commission,
            "Yes" if link.is_active else "No",
            link.created_at.strftime("%Y-%m-%d %H:%M") if link.created_at else "",
        ])

    buf.seek(0)
    return StreamingResponse(buf, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=links_export.csv"})


@router.patch("/{link_id}/status", response_model=dict)
async def toggle_link_status(
    link_id: str,
    is_active: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.user_type != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    link = await db.get(AffiliateLink, link_id)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    link.is_active = is_active
    await db.commit()
    return {"data": {"message": f"Link {'activated' if is_active else 'deactivated'}"}}
