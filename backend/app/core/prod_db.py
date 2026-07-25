"""READ-ONLY connection to the BeautyBarn production database.

This engine exists purely to source product data for the affiliate product master.
Every session opened here is fixed to READ ONLY at the transaction level, so an
accidental INSERT/UPDATE/DELETE fails at the database rather than silently
mutating production. Never add write paths through this module.
"""
import ssl

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import settings

_engine = None
_session_factory = None


def _build_engine():
    if not settings.PROD_DB_URL:
        raise RuntimeError("PROD_DB_URL is not configured; cannot reach production DB.")
    # DigitalOcean managed Postgres requires SSL.
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return create_async_engine(
        settings.PROD_DB_URL,
        connect_args={"ssl": ctx},
        pool_size=2,
        max_overflow=0,
        pool_pre_ping=True,
        echo=False,
    )


def get_prod_engine():
    global _engine, _session_factory
    if _engine is None:
        _engine = _build_engine()
        _session_factory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)
    return _engine


async def prod_session() -> AsyncSession:
    """Open a session pinned to a READ ONLY transaction."""
    get_prod_engine()
    session = _session_factory()
    await session.execute(text("SET TRANSACTION READ ONLY"))
    return session
