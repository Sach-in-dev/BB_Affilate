import asyncio
import sys
import os

# Add the app directory to the sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import async_session
from app.services.product_sync import sync_products

async def run_sync():
    print("Starting product sync from production database...")
    async with async_session() as db:
        result = await sync_products(db)
        print("Sync complete:", result)

if __name__ == "__main__":
    asyncio.run(run_sync())
