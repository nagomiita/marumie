from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import EnumOrganizationType, Organization
from ..schemas import OrganizationCreate, OrganizationRead


class OrganizationService:
    """組織に関するビジネスロジックを提供するサービスクラス"""

    @staticmethod
    async def list_organizations(
        session: AsyncSession,
        organization_type: EnumOrganizationType | None = None,
        user_id: str | None = None,
    ) -> list[OrganizationRead]:
        """組織一覧を取得

        Args:
            session: データベースセッション
            organization_type: 組織タイプでフィルタ
            user_id: ユーザーIDでフィルタ

        Returns:
            組織のリスト
        """
        stmt = select(Organization)
        if organization_type is not None:
            stmt = stmt.where(Organization.type == organization_type)
        if user_id is not None:
            stmt = stmt.where(Organization.user_id == user_id)

        stmt = stmt.order_by(Organization.created_at.desc())
        result = await session.execute(stmt)
        organizations = result.scalars().all()
        return [OrganizationRead.model_validate(org) for org in organizations]

    @staticmethod
    async def get_organization(session: AsyncSession, slug: str) -> OrganizationRead:
        """組織をスラッグで取得

        Args:
            session: データベースセッション
            slug: 組織のスラッグ

        Returns:
            組織情報

        Raises:
            HTTPException: 組織が見つからない場合
        """
        stmt = select(Organization).where(Organization.slug == slug)
        organization = (await session.execute(stmt)).scalar_one_or_none()
        if organization is None:
            raise HTTPException(status_code=404, detail="Organization not found")
        return OrganizationRead.model_validate(organization)

    @staticmethod
    async def create_organization(
        session: AsyncSession,
        organization_data: OrganizationCreate,
    ) -> OrganizationRead:
        """新規組織を作成

        Args:
            session: データベースセッション
            organization_data: 組織作成データ

        Returns:
            作成された組織情報
        """
        organization = Organization(**organization_data.model_dump())
        session.add(organization)
        await session.commit()
        await session.refresh(organization)
        return OrganizationRead.model_validate(organization)

    @staticmethod
    async def delete_organization(session: AsyncSession, organization_id: str) -> None:
        """組織を削除

        Args:
            session: データベースセッション
            organization_id: 組織ID

        Raises:
            HTTPException: 組織が見つからない場合
        """
        stmt = select(Organization).where(Organization.id == organization_id)
        organization = (await session.execute(stmt)).scalar_one_or_none()
        if organization is None:
            raise HTTPException(status_code=404, detail="Organization not found")
        await session.delete(organization)
        await session.commit()
