import asyncio

from app.core.db import engine
from sqlalchemy import text


async def check():
    async with engine.connect() as conn:
        result = await conn.execute(
            text(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
            )
        )
        tables = [row[0] for row in result]
        print("\n".join(tables))


asyncio.run(check())
