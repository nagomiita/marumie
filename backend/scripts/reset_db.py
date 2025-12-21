"""
Database reset script for Marumie backend
Run with: uv run python -m scripts.reset_db

WARNING: This script will DROP ALL DATA in the database!
Only use this in development environments.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from sqlalchemy import text

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.db import engine


async def reset_database():
    """
    完全にデータベースをリセット

    - publicスキーマを削除
    - publicスキーマを再作成
    - 権限を再設定

    WARNING: すべてのテーブル、データ、型定義が削除されます
    """
    print("⚠️  WARNING: This will DELETE ALL DATA in the database!")
    print("   Press Ctrl+C to cancel, or wait 3 seconds to continue...")

    try:
        await asyncio.sleep(3)
    except KeyboardInterrupt:
        print("\n❌ Database reset cancelled")
        return

    print("\n🔄 Resetting database...")

    try:
        async with engine.begin() as conn:
            # publicスキーマを完全削除（すべてのテーブル、型、関数などを含む）
            await conn.execute(text("DROP SCHEMA public CASCADE"))
            print("  ✓ Dropped public schema")

            # publicスキーマを再作成
            await conn.execute(text("CREATE SCHEMA public"))
            print("  ✓ Created public schema")

            # 権限を再設定
            await conn.execute(text("GRANT ALL ON SCHEMA public TO postgres"))
            await conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
            print("  ✓ Granted permissions")

        print("\n✅ Database reset complete!")
        print("   Next steps:")
        print("   1. Run migrations: cd backend && uv run alembic upgrade head")
        print("   2. Seed data: cd backend && uv run python -m scripts.seed")

    except Exception as e:
        print(f"\n❌ Error resetting database: {e}")
        raise


async def main():
    """メイン関数"""
    await reset_database()


if __name__ == "__main__":
    asyncio.run(main())
