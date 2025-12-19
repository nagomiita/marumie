from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import distinct, extract, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..models.entities import PersonalTransaction
from ..schemas import PersonalTransactionRead

router = APIRouter(prefix="/personal-transactions", tags=["personal_transactions"])


@router.get(
    "",
    response_model=list[PersonalTransactionRead],
    operation_id="list_personal_transactions",
)
async def list_personal_transactions(
    organization_id: str | None = Query(None, description="Filter by organization id"),
    year: int | None = Query(None, description="Filter by calendar year"),
    month: int | None = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    limit: int = Query(9000, ge=1, le=9000, description="Max items to return"),
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

    stmt = stmt.order_by(
        PersonalTransaction.date.desc(), PersonalTransaction.created_at.desc()
    )
    stmt = stmt.limit(limit).offset(offset)

    transactions = (await session.execute(stmt)).scalars().all()
    return [PersonalTransactionRead.model_validate(tx) for tx in transactions]


@router.get("/years", response_model=list[int], operation_id="get_available_years")
async def get_available_years(
    organization_id: str | None = None,
    session: AsyncSession = Depends(get_db_session),
) -> list[int]:
    """組織の取引データが存在する年度のリストを取得"""
    stmt = select(distinct(extract("year", PersonalTransaction.date))).order_by(
        extract("year", PersonalTransaction.date).desc()
    )

    if organization_id:
        stmt = stmt.where(PersonalTransaction.organization_id == organization_id)

    years = (await session.execute(stmt)).scalars().all()
    return [int(year) for year in years]
