from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..schemas import TransactionRead
from ..services import TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get(
    "",
    response_model=list[TransactionRead],
    operation_id="list_transactions",
)
async def list_transactions(
    organization_id: str | None = Query(None, description="Filter by organization id"),
    year: int | None = Query(None, description="Filter by calendar year"),
    month: int | None = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    limit: int = Query(9000, ge=1, le=9000, description="Max items to return"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    session: AsyncSession = Depends(get_db_session),
) -> list[TransactionRead]:
    return await TransactionService.list_transactions(
        session, organization_id, year, month, limit, offset
    )


@router.get("/years", response_model=list[int], operation_id="get_available_years")
async def get_available_years(
    organization_id: str | None = None,
    session: AsyncSession = Depends(get_db_session),
) -> list[int]:
    """組織の取引データが存在する年度のリストを取得"""
    return await TransactionService.get_available_years(session, organization_id)
