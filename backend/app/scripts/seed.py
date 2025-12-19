"""
Database seeding script for Marumie backend
Run with: python -m app.scripts.seed
"""

from __future__ import annotations

import asyncio
from datetime import date, datetime

from sqlalchemy import select

from app.core.db import SessionLocal
from app.models.entities import (
    Organization,
    OrganizationType,
    PoliticalOrganization,
    Transaction,
    TransactionType,
)


async def seed_organizations():
    """Seed initial organizations"""
    async with SessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(Organization).limit(1))
        if result.scalars().first():
            print("Organizations already seeded, skipping...")
            return

        orgs = [
            Organization(
                name="team-hirano",
                display_name="平野大輔",
                slug="team-hirano",
                type=OrganizationType.POLITICAL_ORGANIZATION,
                description="政治団体テスト",
            ),
        ]

        session.add_all(orgs)
        await session.commit()
        print(f"✓ Created {len(orgs)} organizations")


async def seed_political_organizations():
    """Seed political organizations"""
    async with SessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(PoliticalOrganization).limit(1))
        if result.scalars().first():
            print("Political organizations already seeded, skipping...")
            return

        pol_orgs = [
            PoliticalOrganization(
                display_name="平野大輔後援会",
                slug="team-hirano",
                org_name="平野大輔",
                description="政治組織サンプル",
            ),
        ]

        session.add_all(pol_orgs)
        await session.commit()
        print(f"✓ Created {len(pol_orgs)} political organizations")


async def seed_transactions():
    """Seed sample transactions"""
    async with SessionLocal() as session:
        # Get political organization
        result = await session.execute(
            select(PoliticalOrganization).where(
                PoliticalOrganization.slug == "team-hirano"
            )
        )
        pol_org = result.scalars().first()
        if not pol_org:
            print("Political organization not found, skipping transactions...")
            return

        # Check if already seeded
        result = await session.execute(
            select(Transaction)
            .where(Transaction.political_organization_id == pol_org.id)
            .limit(1)
        )
        if result.scalars().first():
            print("Transactions already seeded, skipping...")
            return

        transactions = [
            Transaction(
                political_organization_id=pol_org.id,
                transaction_no="T2025-001",
                transaction_date=date(2025, 4, 1),
                financial_year=2025,
                transaction_type=TransactionType.INCOME,
                debit_account="現金",
                debit_amount=100000,
                credit_account="寄付金収入",
                credit_amount=100000,
                category_key="donation_income",
                label="個人寄付",
                hash="sample001",
            ),
            Transaction(
                political_organization_id=pol_org.id,
                transaction_no="T2025-002",
                transaction_date=date(2025, 4, 15),
                financial_year=2025,
                transaction_type=TransactionType.EXPENSE,
                debit_account="事務所費",
                debit_amount=50000,
                credit_account="現金",
                credit_amount=50000,
                category_key="office_expense",
                label="家賃",
                hash="sample002",
            ),
        ]

        session.add_all(transactions)
        await session.commit()
        print(f"✓ Created {len(transactions)} transactions")


async def main():
    """Run all seed functions"""
    print("Starting database seed...")

    try:
        await seed_organizations()
        await seed_political_organizations()
        await seed_transactions()
        print("\n✅ Database seeding completed successfully!")
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
