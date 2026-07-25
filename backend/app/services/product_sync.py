"""Sync the affiliate product master from the BeautyBarn production database.

Strictly read-only against production: a single SELECT, run inside a READ ONLY
transaction, capped by PRODUCT_SYNC_LIMIT. Nothing is ever written back.
"""
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.prod_db import prod_session
from app.models.product import Product

# One row per product: cheapest active variant supplies price/SKU/stock,
# primary category and tags are aggregated.
PROD_QUERY = text(
    """
    SELECT
        p.id,
        p.title            AS name,
        p.handle,
        p.thumbnail,
        p.status::text     AS status,
        p.average_rating   AS rating,
        b.title            AS brand,
        v.sku              AS sku,
        v.price            AS price,
        NULLIF(v.special_price, 0) AS discount_price,
        COALESCE(v.inventory_quantity, 0) AS inventory_quantity,
        v.allow_back_order,
        -- Categories are a tree: "All Category >> Product Type >> <leaf>".
        -- The Product Type leaf is the useful browse facet; promo/loyalty nodes
        -- (e.g. "Black Friday Sale") sit at the root and are poor filters.
        (
            SELECT c.name
            FROM product_category_products pcp
            JOIN product_categories c ON c.id = pcp.category_id
            WHERE pcp.product_id = p.id AND c.deleted_at IS NULL
            ORDER BY
                CASE
                    WHEN c.full_path LIKE 'All Category >> Product Type >> %' THEN 0
                    WHEN c.parent_id IS NOT NULL THEN 1
                    ELSE 2
                END,
                c.rank
            LIMIT 1
        ) AS category,
        COALESCE((
            SELECT array_agg(t.title)
            FROM product_tags pt
            JOIN tags t ON t.id = pt.tag_id
            WHERE pt.product_id = p.id AND t.deleted_at IS NULL
        ), ARRAY[]::text[]) AS tags,
        COALESCE(p.thumbnail, (
            SELECT pi.image
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi."order"
            LIMIT 1
        )) AS image
    FROM product p
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN LATERAL (
        SELECT pv.*
        FROM product_variants pv
        WHERE pv.product_id = p.id AND pv.deleted_at IS NULL
        ORDER BY pv.variant_rank NULLS LAST, pv.price
        LIMIT 1
    ) v ON TRUE
    WHERE p.status = 'ACTIVE'
      AND p.visibility = 'PUBLIC'
      AND p.handle IS NOT NULL
      AND v.price IS NOT NULL
    ORDER BY p.orders_count DESC NULLS LAST, p.created_at DESC
    LIMIT :limit
    """
)


def build_product_url(handle: str) -> str:
    path = settings.STOREFRONT_PRODUCT_PATH.format(handle=handle)
    return f"{settings.STOREFRONT_BASE_URL.rstrip('/')}{path}"


def build_image_url(key: str | None) -> str | None:
    """Production stores relative asset keys; resolve them against the CDN."""
    if not key:
        return None
    if key.startswith(("http://", "https://")):
        return key
    return f"{settings.ASSET_CDN_BASE_URL.rstrip('/')}/{key.lstrip('/')}"


async def fetch_products_from_prod(limit: int) -> list[dict]:
    """Run the single read-only SELECT against production."""
    limit = max(1, min(limit, settings.PRODUCT_SYNC_LIMIT))
    session = await prod_session()
    try:
        result = await session.execute(PROD_QUERY, {"limit": limit})
        return [dict(r) for r in result.mappings().all()]
    finally:
        await session.close()


async def sync_products(db: AsyncSession, limit: int | None = None) -> dict:
    """Upsert production products into the local affiliate product master."""
    limit = limit or settings.PRODUCT_SYNC_LIMIT
    rows = await fetch_products_from_prod(limit)

    created = updated = 0
    for row in rows:
        in_stock = (row["inventory_quantity"] or 0) > 0 or bool(row.get("allow_back_order"))
        values = {
            "name": row["name"],
            "brand": row["brand"],
            "category": row["category"],
            "price": row["price"],
            "discount_price": row["discount_price"],
            "image": build_image_url(row["image"]),
            "product_url": build_product_url(row["handle"]),
            "sku": row["sku"],
            "status": row["status"],
            "availability": in_stock,
            "tags": list(row["tags"] or []),
            "handle": row["handle"],
            "rating": row["rating"],
        }

        existing = await db.get(Product, row["id"])
        if existing is None:
            db.add(Product(id=row["id"], **values))
            created += 1
        else:
            for k, v in values.items():
                setattr(existing, k, v)
            updated += 1

    await db.commit()

    total = await db.execute(select(Product))
    return {
        "fetched": len(rows),
        "created": created,
        "updated": updated,
        "total_in_master": len(total.scalars().all()),
    }
