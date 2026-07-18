"""Customer-facing endpoints. No authentication — these are hit from social traffic."""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.affiliate import AffiliateLink
from app.models.product import Product
from app.models.user import User
from app.schemas.catalog import ProductResponse
from app.services.links import record_click

router = APIRouter(prefix="/public", tags=["public"])


def _client_meta(request: Request) -> dict:
    return {
        "referrer": request.headers.get("referer"),
        "user_agent": request.headers.get("user-agent"),
        "ip_address": (request.client.host if request.client else None),
    }


def _infer_source(request: Request, explicit: str | None) -> str:
    """Derive traffic source from ?source= or the referrer."""
    if explicit:
        return explicit.lower()
    ref = (request.headers.get("referer") or "").lower()
    for name in ("instagram", "youtube", "facebook", "whatsapp", "twitter", "linkedin"):
        if name in ref:
            return name
    return "direct"


async def _load_link(db: AsyncSession, code: str) -> AffiliateLink:
    link = await db.scalar(select(AffiliateLink).where(AffiliateLink.code == code))
    if not link:
        raise HTTPException(status_code=404, detail="This link is invalid or has expired")
    return link


@router.get("/links/{code}", response_model=dict)
async def resolve_link(
    code: str,
    request: Request,
    source: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Resolve a link for the customer.

    Single-product links return a redirect target. Bundle links return the full
    branded landing-page payload (creator profile + products). A click is recorded
    before anything is returned.
    """
    link = await _load_link(db, code)
    creator = await db.get(User, link.creator_id)

    # Bundle page opens are tracked with no product_id; single links attribute
    # the click to their one product immediately.
    single_product_id = link.items[0].product_id if link.link_type == "single" and link.items else None
    await record_click(
        db,
        link,
        product_id=single_product_id,
        source=_infer_source(request, source),
        **_client_meta(request),
    )

    products = [
        ProductResponse.model_validate(i.product).model_dump()
        for i in link.items
        if i.product is not None
    ]

    payload = {
        "code": link.code,
        "link_type": link.link_type,
        "title": link.title,
        "products": products,
        "creator": {
            "name": f"{creator.first_name} {creator.last_name}" if creator else "",
            "handle": creator.handle if creator else None,
            "bio": creator.bio if creator else None,
            "avatar_url": creator.avatar_url if creator else None,
            "instagram": creator.instagram if creator else None,
            "youtube": creator.youtube if creator else None,
        },
        "redirect_url": products[0]["product_url"] if link.link_type == "single" and products else None,
    }
    return {"data": payload}


@router.get("/links/{code}/go/{product_id}")
async def track_and_redirect(
    code: str,
    product_id: str,
    request: Request,
    source: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Per-product click from the bundle landing page → BeautyBarn product page.

    The click is stored before the redirect is issued.
    """
    link = await _load_link(db, code)
    product = await db.get(Product, product_id)
    if not product or product_id not in {i.product_id for i in link.items}:
        raise HTTPException(status_code=404, detail="Product is not part of this link")

    await record_click(
        db,
        link,
        product_id=product_id,
        source=_infer_source(request, source),
        **_client_meta(request),
    )
    return RedirectResponse(url=product.product_url, status_code=302)
