from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..models.entities import Organization
from ..models.enums import OrganizationType
from ..schemas import OrganizationCreate, OrganizationRead

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get(
    "", response_model=list[OrganizationRead], operation_id="list_organizations"
)
async def list_organizations(
    organization_type: OrganizationType | None = Query(
        None, description="Filter by organization type"
    ),
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


@router.get("/{slug}", response_model=OrganizationRead, operation_id="get_organization")
async def get_organization(
    slug: str,
    session: AsyncSession = Depends(get_db_session),
) -> OrganizationRead:
    stmt = select(Organization).where(Organization.slug == slug)
    organization = (await session.execute(stmt)).scalar_one_or_none()
    if organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return OrganizationRead.model_validate(organization)


@router.post(
    "",
    response_model=OrganizationRead,
    status_code=201,
    operation_id="create_organization",
)
async def create_organization(
    organization_data: OrganizationCreate,
    session: AsyncSession = Depends(get_db_session),
) -> OrganizationRead:
    organization = Organization(**organization_data.model_dump())
    session.add(organization)
    await session.commit()
    await session.refresh(organization)
    return OrganizationRead.model_validate(organization)


@router.delete(
    "/{organization_id}", status_code=204, operation_id="delete_organization"
)
async def delete_organization(
    organization_id: str,
    session: AsyncSession = Depends(get_db_session),
) -> None:
    stmt = select(Organization).where(Organization.id == organization_id)
    organization = (await session.execute(stmt)).scalar_one_or_none()
    if organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    await session.delete(organization)
    await session.commit()
