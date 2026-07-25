import asyncio
from app.core.database import async_session
from app.models.product import Product
from sqlalchemy import select, func

async def run():
    db = async_session()
    res = await db.execute(select(func.count()).select_from(Product))
    count = res.scalar()
    print(f"Products in DB: {count}")
    await db.close()

asyncio.run(run())
