"""
CSV data import script for transactions
Run with: uv run python -m scripts.import_csv
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import select

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.db import SessionLocal
from app.models import Organization
from app.services import CSVUploadService

# Load environment variables
load_dotenv()


async def import_transactions_from_csv(csv_path: Path, organization_id: str):
    """CSVファイルからトランザクションをインポート"""
    async with SessionLocal() as session:
        # CSVUploadServiceを使用してインポート
        result = await CSVUploadService.import_csv_from_path(
            session, organization_id, str(csv_path)
        )
        print(f"✅ {result['message']}")


async def main():
    """メイン処理"""
    print("Starting CSV import...")

    # 組織を取得
    async with SessionLocal() as session:
        result = await session.execute(select(Organization).limit(1))
        organization = result.scalars().first()

        if not organization:
            print("❌ No organization found. Please run seed script first.")
            return

        print(f"📊 Importing to organization: {organization.display_name}")

    # CSVファイルのパス
    csv_path = backend_dir / "scripts" / "data" / "output" / "unified_all.csv"

    if not csv_path.exists():
        print(f"❌ CSV file not found: {csv_path}")
        return

    # インポート実行
    await import_transactions_from_csv(csv_path, organization.id)
    print("✅ CSV import completed!")


if __name__ == "__main__":
    asyncio.run(main())
