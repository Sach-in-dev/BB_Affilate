import asyncio
from app.core.database import async_session
from app.models.product import Product
from sqlalchemy import delete

async def run():
    db = async_session()
    await db.execute(delete(Product))
    await db.commit()
    print("Products wiped.")
    await db.close()

asyncio.run(run())
