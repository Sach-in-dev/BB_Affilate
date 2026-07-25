import asyncio
from app.core.database import async_session
from app.models.product import Product
from sqlalchemy import select
import json

async def run():
    db = async_session()
    res = await db.execute(select(Product).limit(10))
    rows = res.scalars().all()
    out = []
    for r in rows:
        out.append({
            'id': r.id,
            'name': r.name,
            'brand': r.brand,
            'category': r.category,
            'price': r.price,
            'discount_price': r.discount_price,
            'image': r.image,
            'product_url': r.product_url,
            'sku': r.sku,
            'status': r.status,
            'availability': r.availability,
            'tags': r.tags,
            'handle': r.handle,
            'rating': r.rating,
            'is_affiliate_enabled': r.is_affiliate_enabled
        })
    print(json.dumps(out))
    await db.close()

asyncio.run(run())
