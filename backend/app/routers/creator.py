from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.affiliate import AffiliateLink, AffiliateLinkItem, LinkClick
from app.models.banner import Banner
from app.models.product import Product
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.catalog import (
    GenerateLinkRequest,
    AffiliateLinkResponse,
    LinkItemResponse,
    ProductResponse,
    BannerResponse,
    CreatorProfileResponse,
    UpdateProfileRequest,
)
from app.services.links import create_link, public_url

router = APIRouter(prefix="/creator", tags=["creator"])


async def get_creator(user: User = Depends(get_current_user)) -> User:
    if user.user_type != "creator":
        raise HTTPException(status_code=403, detail="Creator account required")
    return user


def serialize_link(link: AffiliateLink) -> dict:
    return AffiliateLinkResponse(
        id=link.id,
        code=link.code,
        link_type=link.link_type,
        title=link.title,
        url=public_url(link.code),
        total_clicks=link.total_clicks,
        total_orders=link.total_orders,
        total_commission=link.total_commission,
        items=[
            LinkItemResponse(
                product=ProductResponse.model_validate(i.product),
                clicks=i.clicks,
            )
            for i in link.items
            if i.product is not None
        ],
        created_at=link.created_at.isoformat() if link.created_at else None,
    ).model_dump()


@router.post("/links", response_model=dict)
async def generate_link(
    body: GenerateLinkRequest,
    creator: User = Depends(get_creator),
    db: AsyncSession = Depends(get_db),
):
    """Generate a single-product or multi-product bundled tracking link."""
    if not body.product_ids:
        raise HTTPException(status_code=400, detail="Select at least one product")

    # De-duplicate while preserving order.
    ids = list(dict.fromkeys(body.product_ids))
    found = await db.execute(select(Product.id).where(Product.id.in_(ids)))
    valid = set(found.scalars().all())
    missing = [i for i in ids if i not in valid]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown product(s): {', '.join(missing)}")

    link = await create_link(db, creator.id, ids, body.title)
    return {"data": serialize_link(link)}


@router.get("/links", response_model=dict)
async def my_links(
    creator: User = Depends(get_creator),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.execute(
        select(AffiliateLink)
        .where(AffiliateLink.creator_id == creator.id)
        .order_by(desc(AffiliateLink.created_at))
    )
    return {"data": [serialize_link(l) for l in rows.scalars().all()]}


@router.delete("/links/{link_id}", response_model=dict)
async def delete_link(
    link_id: str,
    creator: User = Depends(get_creator),
    db: AsyncSession = Depends(get_db),
):
    link = await db.scalar(
        select(AffiliateLink).where(
            AffiliateLink.id == link_id, AffiliateLink.creator_id == creator.id
        )
    )
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    await db.delete(link)
    await db.commit()
    return {"data": {"id": link_id, "deleted": True}}


@router.get("/stats", response_model=dict)
async def dashboard_stats(
    creator: User = Depends(get_creator),
    db: AsyncSession = Depends(get_db),
):
    """Cards for the creator home: clicks, orders, commission, conversion rate."""
    totals = (
        await db.execute(
            select(
                func.coalesce(func.sum(AffiliateLink.total_clicks), 0),
                func.coalesce(func.sum(AffiliateLink.total_orders), 0),
                func.coalesce(func.sum(AffiliateLink.total_commission), 0),
                func.count(AffiliateLink.id),
            ).where(AffiliateLink.creator_id == creator.id)
        )
    ).one()
    clicks, orders, commission, link_count = totals
    conversion = round((orders / clicks) * 100, 2) if clicks else 0.0

    # Top products by tracked clicks.
    top_rows = await db.execute(
        select(Product, func.sum(AffiliateLinkItem.clicks).label("c"))
        .join(AffiliateLinkItem, AffiliateLinkItem.product_id == Product.id)
        .join(AffiliateLink, AffiliateLink.id == AffiliateLinkItem.link_id)
        .where(AffiliateLink.creator_id == creator.id)
        .group_by(Product.id)
        .order_by(desc("c"))
        .limit(5)
    )
    top_products = [
        {"product": ProductResponse.model_validate(p).model_dump(), "clicks": int(c or 0)}
        for p, c in top_rows.all()
    ]

    # Recent click activity.
    recent_rows = await db.execute(
        select(LinkClick, Product)
        .outerjoin(Product, Product.id == LinkClick.product_id)
        .where(LinkClick.creator_id == creator.id)
        .order_by(desc(LinkClick.clicked_at))
        .limit(8)
    )
    recent = [
        {
            "code": c.code,
            "product_name": p.name if p else None,
            "source": c.source,
            "clicked_at": c.clicked_at.isoformat() if c.clicked_at else None,
        }
        for c, p in recent_rows.all()
    ]

    # Clicks per day for the last 7 days (analytics chart).
    since = datetime.now(timezone.utc) - timedelta(days=6)
    series_rows = await db.execute(
        select(func.date(LinkClick.clicked_at).label("d"), func.count().label("c"))
        .where(LinkClick.creator_id == creator.id, LinkClick.clicked_at >= since)
        .group_by("d")
        .order_by("d")
    )
    series = [{"date": str(d), "clicks": int(c)} for d, c in series_rows.all()]

    return {
        "data": {
            "total_clicks": int(clicks),
            "total_orders": int(orders),
            "total_commission": int(commission),
            "conversion_rate": conversion,
            "total_links": int(link_count),
            "top_products": top_products,
            "recent_activity": recent,
            "clicks_series": series,
        }
    }


@router.get("/banners", response_model=dict)
async def dashboard_banners(
    _: User = Depends(get_creator),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.execute(
        select(Banner).where(Banner.is_active.is_(True)).order_by(Banner.sort_order)
    )
    return {"data": [BannerResponse.model_validate(b).model_dump() for b in rows.scalars().all()]}


@router.get("/profile", response_model=dict)
async def get_profile(creator: User = Depends(get_creator)):
    return {"data": CreatorProfileResponse.model_validate(creator).model_dump()}


@router.put("/profile", response_model=dict)
async def update_profile(
    body: UpdateProfileRequest,
    creator: User = Depends(get_creator),
    db: AsyncSession = Depends(get_db),
):
    if body.handle:
        clash = await db.scalar(
            select(User.id).where(User.handle == body.handle, User.id != creator.id)
        )
        if clash:
            raise HTTPException(status_code=400, detail="That handle is already taken")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(creator, field, value)

    await db.commit()
    await db.refresh(creator)
    return {"data": CreatorProfileResponse.model_validate(creator).model_dump()}
