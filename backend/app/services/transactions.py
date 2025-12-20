from __future__ import annotations

from sqlalchemy import distinct, extract, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Transaction
from ..schemas import TransactionRead


class TransactionService:
    """トランザクションに関するビジネスロジックを提供するサービスクラス"""

    @staticmethod
    async def list_transactions(
        session: AsyncSession,
        organization_id: str | None = None,
        year: int | None = None,
        month: int | None = None,
        limit: int = 9000,
        offset: int = 0,
    ) -> list[TransactionRead]:
        """トランザクション一覧を取得

        Args:
            session: データベースセッション
            organization_id: 組織IDでフィルタ
            year: 年でフィルタ
            month: 月でフィルタ (1-12)
            limit: 取得する最大件数
            offset: スキップする件数

        Returns:
            トランザクションのリスト
        """
        stmt = select(Transaction)
        if organization_id is not None:
            stmt = stmt.where(Transaction.organization_id == organization_id)
        if year is not None:
            stmt = stmt.where(extract("year", Transaction.date) == year)
        if month is not None:
            stmt = stmt.where(extract("month", Transaction.date) == month)

        stmt = stmt.order_by(Transaction.date.desc(), Transaction.created_at.desc())
        stmt = stmt.limit(limit).offset(offset)

        transactions = (await session.execute(stmt)).scalars().all()
        return [TransactionRead.model_validate(tx) for tx in transactions]

    @staticmethod
    async def get_available_years(
        session: AsyncSession,
        organization_id: str | None = None,
    ) -> list[int]:
        """組織の取引データが存在する年度のリストを取得

        Args:
            session: データベースセッション
            organization_id: 組織IDでフィルタ

        Returns:
            年のリスト（降順）
        """
        stmt = select(distinct(extract("year", Transaction.date))).order_by(
            extract("year", Transaction.date).desc()
        )

        if organization_id:
            stmt = stmt.where(Transaction.organization_id == organization_id)

        years = (await session.execute(stmt)).scalars().all()
        return [int(year) for year in years]
