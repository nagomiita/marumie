from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..models import EnumOrganizationType
from ..schemas import OrganizationCreate, OrganizationRead
from ..services import OrganizationService

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get(
    "", response_model=list[OrganizationRead], operation_id="list_organizations"
)
async def list_organizations(
    organization_type: EnumOrganizationType | None = Query(
        None, description="Filter by organization type"
    ),
    user_id: str | None = Query(None, description="Filter by owner user id"),
    session: AsyncSession = Depends(get_db_session),
) -> list[OrganizationRead]:
    return await OrganizationService.list_organizations(
        session, organization_type, user_id
    )


@router.get("/{slug}", response_model=OrganizationRead, operation_id="get_organization")
async def get_organization(
    slug: str,
    session: AsyncSession = Depends(get_db_session),
) -> OrganizationRead:
    return await OrganizationService.get_organization(session, slug)


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
    return await OrganizationService.create_organization(session, organization_data)


@router.delete(
    "/{organization_id}", status_code=204, operation_id="delete_organization"
)
async def delete_organization(
    organization_id: str,
    session: AsyncSession = Depends(get_db_session),
) -> None:
    await OrganizationService.delete_organization(session, organization_id)
