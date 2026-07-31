from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, async_session
from app.core.seed import seed_defaults
from app.routers import auth, admin, products, creator, public, banners, user_management, waitlist

# Ensure models are imported so metadata is registered before create_all.
from app.models import user as _user  # noqa: F401
from app.models import role as _role  # noqa: F401
from app.models import product as _product  # noqa: F401
from app.models import affiliate as _affiliate  # noqa: F401
from app.models import banner as _banner  # noqa: F401
from app.models import activity_log as _activity_log  # noqa: F401
from app.models import waitlist as _waitlist  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with async_session() as db:
        await seed_defaults(db)
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth.router, admin.router, products.router, creator.router, public.router, banners.router, user_management.router, waitlist.router):
    app.include_router(r, prefix="/api")
