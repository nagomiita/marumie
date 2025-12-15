from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..models.entities import Organization
from ..models.enums import OrganizationType
from ..schemas import OrganizationRead

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("", response_model=list[OrganizationRead])
async def list_organizations(
    organization_type: OrganizationType | None = Query(None, description="Filter by organization type"),
    user_id: str | None = Query(None, description="Filter by owner user id"),
    session: AsyncSession = Depends(get_db_session),
) -> list[OrganizationRead]:
    stmt = select(Organization)
    if organization_type is not None:
        stmt = stmt.where(Organization.type == organization_type)
    if user_id is not None:
        stmt = stmt.where(Organization.user_id == user_id)

    stmt = stmt.order_by(Organization.created_at.desc())
    result = await session.execute(stmt)
    organizations = result.scalars().all()
    return [OrganizationRead.model_validate(org) for org in organizations]


@router.get("/{slug}", response_model=OrganizationRead)
async def get_organization(
    slug: str,
    session: AsyncSession = Depends(get_db_session),
) -> OrganizationRead:
    stmt = select(Organization).where(Organization.slug == slug)
    organization = (await session.execute(stmt)).scalar_one_or_none()
    if organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return OrganizationRead.model_validate(organization)
