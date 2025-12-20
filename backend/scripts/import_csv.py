"""
CSV data import script for transactions
Run with: uv run python -m scripts.import_csv
"""

from __future__ import annotations

import asyncio
import csv
import hashlib
import sys
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import select

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.db import SessionLocal
from app.models import EnumTransactionType, Organization, Transaction

# Load environment variables
load_dotenv()


def parse_date(date_str: str) -> date:
    """日付文字列をdateに変換"""
    return datetime.strptime(date_str, "%Y/%m/%d").date()


def parse_amount(amount_str: str) -> Decimal:
    """金額文字列をDecimalに変換"""
    return Decimal(amount_str.replace(",", ""))


def determine_transaction_type(category: str) -> EnumTransactionType:
    """収支区分からEnumTransactionTypeを決定"""
    if category == "収入":
        return EnumTransactionType.INCOME
    else:
        return EnumTransactionType.EXPENSE


def generate_hash(row: dict) -> str:
    """トランザクションのハッシュ値を生成"""
    hash_str = f"{row['date']}{row['category']}{row['subcategory']}{row['amount']}{row['type']}{row['payment_method']}{row['description']}"
    return hashlib.md5(hash_str.encode()).hexdigest()


async def import_transactions_from_csv(csv_path: Path, organization_id: str):
    """CSVファイルからトランザクションをインポート"""
    async with SessionLocal() as session:
        # CSVファイルを読み込み (BOM対応)
        transactions = []
        with open(csv_path, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # データを変換
                date = parse_date(row["日付"])
                category = row["カテゴリ"]
                subcategory = row["サブカテゴリ"] if row["サブカテゴリ"] else None
                amount = parse_amount(row["金額"])
                transaction_type = determine_transaction_type(row["収支区分"])
                payment_method = row["支払方法"]
                description = row["摘要"]
                memo = row["メモ"] if row["メモ"] else None

                # 収入の場合は金額を正、支出の場合は負にする
                if transaction_type == EnumTransactionType.EXPENSE:
                    amount = -abs(amount)
                else:
                    amount = abs(amount)

                # ハッシュ値を生成
                transaction_dict = {
                    "date": str(date),
                    "category": category,
                    "subcategory": subcategory or "",
                    "amount": str(amount),
                    "type": transaction_type.value,
                    "payment_method": payment_method,
                    "description": description,
                }
                hash_value = generate_hash(transaction_dict)

                # Transactionオブジェクトを作成
                transaction = Transaction(
                    date=date,
                    category=category,
                    subcategory=subcategory,
                    amount=amount,
                    type=transaction_type,
                    payment_method=payment_method,
                    description=description,
                    memo=memo,
                    hash=hash_value,
                    organization_id=organization_id,
                )
                transactions.append(transaction)

        # バルクインサート
        session.add_all(transactions)
        await session.commit()
        print(f"✅ Imported {len(transactions)} transactions")


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
