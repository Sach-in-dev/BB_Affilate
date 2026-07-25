"""Affiliate link generation and click tracking."""
import secrets
import string

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.affiliate import AffiliateLink, AffiliateLinkItem, LinkClick

ALPHABET = string.ascii_lowercase + string.digits
CODE_LENGTH = 7


async def generate_code(db: AsyncSession) -> str:
    """Short, URL-safe, collision-checked code."""
    while True:
        code = "".join(secrets.choice(ALPHABET) for _ in range(CODE_LENGTH))
        exists = await db.scalar(select(AffiliateLink.id).where(AffiliateLink.code == code))
        if not exists:
            return code


def public_url(code: str) -> str:
    return f"{settings.AFFILIATE_BASE_URL.rstrip('/')}/r/{code}"


async def create_link(
    db: AsyncSession,
    creator_id: str,
    product_ids: list[str],
    title: str | None = None,
) -> AffiliateLink:
    """One product → single link; two or more → bundle link (SOW 3.3 #1)."""
    link_type = "single" if len(product_ids) == 1 else "bundle"
    link = AffiliateLink(
        code=await generate_code(db),
        creator_id=creator_id,
        link_type=link_type,
        title=title,
    )
    # Preserve the creator's selection order on the landing page.
    for pid in product_ids:
        link.items.append(AffiliateLinkItem(product_id=pid))

    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


async def record_click(
    db: AsyncSession,
    link: AffiliateLink,
    product_id: str | None,
    source: str | None,
    referrer: str | None,
    user_agent: str | None,
    ip_address: str | None,
) -> None:
    """Write the click event BEFORE the customer is redirected."""
    db.add(
        LinkClick(
            link_id=link.id,
            code=link.code,
            creator_id=link.creator_id,
            product_id=product_id,
            bundle_id=link.id if link.link_type == "bundle" else None,
            source=source,
            referrer=referrer,
            user_agent=user_agent,
            ip_address=ip_address,
        )
    )
    link.total_clicks = (link.total_clicks or 0) + 1

    # Per-product attribution on the landing page (SOW 3.3 #3).
    if product_id:
        for item in link.items:
            if item.product_id == product_id:
                item.clicks = (item.clicks or 0) + 1
                break

    await db.commit()
