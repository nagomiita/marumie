"""
Database seeding script for Marumie backend
Run with: python -m app.scripts.seed
"""

from __future__ import annotations

import asyncio
import os
from datetime import date, datetime

from dotenv import load_dotenv
from sqlalchemy import select

from app.core.db import SessionLocal
from app.models.entities import (
    Organization,
    OrganizationType,
    PoliticalOrganization,
    Transaction,
    TransactionType,
    User,
    UserRole,
)
from supabase import Client, create_client

# Load environment variables
load_dotenv()


async def seed_users():
    """Seed default users with Supabase authentication"""
    # Default credentials for local development
    ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@example.com")
    ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "admin123456")

    # Get Supabase configuration
    supabase_url = os.getenv("SUPABASE_URL", "http://127.0.0.1:54321")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not service_role_key:
        print(
            "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not found - creating local users only"
        )
        async with SessionLocal() as session:
            result = await session.execute(select(User).limit(1))
            if result.scalars().first():
                print("Users already seeded, skipping...")
                return

            users = [
                User(
                    auth_id="local-admin-001",
                    email=ADMIN_EMAIL,
                    role=UserRole.ADMIN,
                ),
            ]
            session.add_all(users)
            await session.commit()
            print(f"✓ Created {len(users)} local users")
        return

    try:
        # Create Supabase client
        supabase: Client = create_client(supabase_url, service_role_key)

        async with SessionLocal() as session:
            # Check if user already exists in database
            result = await session.execute(
                select(User).where(User.email == ADMIN_EMAIL)
            )
            existing_db_user = result.scalars().first()

            if existing_db_user:
                print(f"✅ Admin user '{ADMIN_EMAIL}' already exists in database")
                return

            # Check if user exists in Supabase
            list_response = supabase.auth.admin.list_users()
            existing_auth_user = next(
                (u for u in list_response if u.email == ADMIN_EMAIL),
                None,
            )

            if existing_auth_user:
                print(f"✅ Admin user '{ADMIN_EMAIL}' already exists in Supabase")
                auth_id = existing_auth_user.id
            else:
                # Create user in Supabase
                create_response = supabase.auth.admin.create_user(
                    {
                        "email": ADMIN_EMAIL,
                        "password": ADMIN_PASSWORD,
                        "email_confirm": True,
                    }
                )
                auth_id = create_response.user.id
                print(f"✅ Created Supabase user: {ADMIN_EMAIL}")

            # Create user in database
            user = User(
                auth_id=auth_id,
                email=ADMIN_EMAIL,
                role=UserRole.ADMIN,
            )
            session.add(user)
            await session.commit()
            print(f"✅ Created database admin record")
            print(f"   Admin: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
            print("   You can now log in to the admin panel")

    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        print("   Admin user creation failed, but seeding will continue")


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
        await seed_users()
        await seed_organizations()
        await seed_political_organizations()
        await seed_transactions()
        print("\n✅ Database seeding completed successfully!")
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
