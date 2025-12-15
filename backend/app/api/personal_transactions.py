from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..models.entities import PersonalTransaction
from ..schemas import PersonalTransactionRead

router = APIRouter(prefix="/personal-transactions", tags=["personal_transactions"])


@router.get("", response_model=list[PersonalTransactionRead])
async def list_personal_transactions(
    organization_id: str | None = Query(None, description="Filter by organization id"),
    year: int | None = Query(None, description="Filter by calendar year"),
    month: int | None = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    limit: int = Query(100, ge=1, le=500, description="Max items to return"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    session: AsyncSession = Depends(get_db_session),
) -> list[PersonalTransactionRead]:
    stmt = select(PersonalTransaction)
    if organization_id is not None:
        stmt = stmt.where(PersonalTransaction.organization_id == organization_id)
    if year is not None:
        stmt = stmt.where(extract("year", PersonalTransaction.date) == year)
    if month is not None:
        stmt = stmt.where(extract("month", PersonalTransaction.date) == month)

    stmt = stmt.order_by(PersonalTransaction.date.desc(), PersonalTransaction.created_at.desc())
    stmt = stmt.limit(limit).offset(offset)

    transactions = (await session.execute(stmt)).scalars().all()
    return [PersonalTransactionRead.model_validate(tx) for tx in transactions]
