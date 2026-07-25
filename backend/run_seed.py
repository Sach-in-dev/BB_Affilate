import asyncio
from app.core.seed import seed_defaults
from app.core.database import async_session

async def run():
    db = async_session()
    await seed_defaults(db)
    await db.close()

asyncio.run(run())
