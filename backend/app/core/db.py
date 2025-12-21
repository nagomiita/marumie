from __future__ import annotations

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from .settings import get_settings


def _build_engine() -> AsyncEngine:
    settings = get_settings()
    # Normalize database URL: if a sync Postgres driver URL (postgres:// or postgresql://)
    # was provided in env, convert it to the asyncpg form required by SQLAlchemy asyncio.
    url = settings.database_url
    if isinstance(url, str):
        # handle legacy short form 'postgres://' and 'postgresql://'
        if url.startswith("postgres://") and "+asyncpg" not in url:
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    return create_async_engine(url, echo=settings.is_development, future=True)


engine: AsyncEngine = _build_engine()
SessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
    class_=AsyncSession,
)


async def get_db_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
