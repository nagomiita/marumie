from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..models.entities import BalanceSnapshot, PoliticalOrganization, Transaction
from ..schemas import BalanceSnapshotRead, PoliticalOrganizationRead, TransactionRead

router = APIRouter(prefix="/political-organizations", tags=["political_organizations"])


@router.get("", response_model=list[PoliticalOrganizationRead])
async def list_political_organizations(
    session: AsyncSession = Depends(get_db_session),
) -> list[PoliticalOrganizationRead]:
    stmt = select(PoliticalOrganization).order_by(PoliticalOrganization.created_at.desc())
    organizations = (await session.execute(stmt)).scalars().all()
    return [PoliticalOrganizationRead.model_validate(org) for org in organizations]


async def _get_political_org_by_slug(slug: str, session: AsyncSession) -> PoliticalOrganization:
    stmt = select(PoliticalOrganization).where(PoliticalOrganization.slug == slug)
    org = (await session.execute(stmt)).scalar_one_or_none()
    if org is None:
        raise HTTPException(status_code=404, detail="Political organization not found")
    return org


@router.get("/{slug}", response_model=PoliticalOrganizationRead)
async def get_political_organization(
    slug: str,
    session: AsyncSession = Depends(get_db_session),
) -> PoliticalOrganizationRead:
    org = await _get_political_org_by_slug(slug, session)
    return PoliticalOrganizationRead.model_validate(org)


@router.get("/{slug}/transactions", response_model=list[TransactionRead])
async def list_transactions(
    slug: str,
    financial_year: int | None = Query(None, description="Filter by financial year"),
    month: int | None = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    limit: int = Query(100, ge=1, le=500, description="Max items to return"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    session: AsyncSession = Depends(get_db_session),
) -> list[TransactionRead]:
    org = await _get_political_org_by_slug(slug, session)

    stmt = select(Transaction).where(Transaction.political_organization_id == org.id)
    if financial_year is not None:
        stmt = stmt.where(Transaction.financial_year == financial_year)
    if month is not None:
        stmt = stmt.where(extract("month", Transaction.transaction_date) == month)

    stmt = stmt.order_by(Transaction.transaction_date.desc(), Transaction.id.desc()).limit(limit).offset(offset)
    transactions = (await session.execute(stmt)).scalars().all()
    return [TransactionRead.model_validate(tx) for tx in transactions]


@router.get("/{slug}/balance-snapshots", response_model=list[BalanceSnapshotRead])
async def list_balance_snapshots(
    slug: str,
    since: date | None = Query(None, description="Optional lower bound for snapshot_date"),
    session: AsyncSession = Depends(get_db_session),
) -> list[BalanceSnapshotRead]:
    org = await _get_political_org_by_slug(slug, session)

    stmt = select(BalanceSnapshot).where(BalanceSnapshot.political_organization_id == org.id)
    if since is not None:
        stmt = stmt.where(BalanceSnapshot.snapshot_date >= since)

    stmt = stmt.order_by(BalanceSnapshot.snapshot_date.desc())
    snapshots = (await session.execute(stmt)).scalars().all()
    return [BalanceSnapshotRead.model_validate(snapshot) for snapshot in snapshots]
