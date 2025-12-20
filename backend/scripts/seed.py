"""
Database seeding script for Marumie backend
Run with: uv run python -m scripts.seed
"""

from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import select
from supabase import Client, create_client

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


from app.core.db import SessionLocal
from app.models import (
    EnumOrganizationType,
    EnumUserRole,
    Organization,
    User,
)

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
                    role=EnumUserRole.ADMIN,
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
                role=EnumUserRole.ADMIN,
            )
            session.add(user)
            await session.commit()
            print("✅ Created database admin record")
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
                type=EnumOrganizationType.POLITICAL_ORGANIZATION,
                description="政治団体テスト",
            ),
        ]

        session.add_all(orgs)
        await session.commit()
        print(f"✓ Created {len(orgs)} organizations")


async def main():
    """Main seeding function"""
    print("Starting database seeding...")
    await seed_users()
    await seed_organizations()
    print("Database seeding completed!")


if __name__ == "__main__":
    asyncio.run(main())
