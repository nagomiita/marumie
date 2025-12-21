from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Category
from ..schemas import CategoryCreate, CategoryRead, CategoryUpdate


class CategoryService:
    """カテゴリに関するビジネスロジックを提供するサービスクラス"""

    @staticmethod
    async def list_categories(
        session: AsyncSession,
        type: str | None = None,
        is_active: bool | None = None,
    ) -> list[CategoryRead]:
        """カテゴリ一覧を取得

        Args:
            session: データベースセッション
            type: フィルタする種別 ("income" | "expense")
            is_active: 有効なカテゴリのみ取得するか（Noneの場合は全て取得）

        Returns:
            カテゴリのリスト
        """
        query = select(Category)

        if type:
            query = query.where(Category.type == type)

        if is_active is not None:
            query = query.where(Category.is_active == is_active)

        query = query.order_by(Category.display_order, Category.id)

        result = await session.execute(query)
        categories = result.scalars().all()

        return [CategoryRead.model_validate(cat) for cat in categories]

    @staticmethod
    async def get_category(session: AsyncSession, id: str) -> CategoryRead:
        """カテゴリをIDで取得

        Args:
            session: データベースセッション
            id: カテゴリID

        Returns:
            カテゴリ情報

        Raises:
            HTTPException: カテゴリが見つからない場合
        """
        stmt = select(Category).where(Category.id == id)
        category = (await session.execute(stmt)).scalar_one_or_none()

        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")

        return CategoryRead.model_validate(category)

    @staticmethod
    async def create_category(
        session: AsyncSession,
        category_data: CategoryCreate,
    ) -> CategoryRead:
        """新規カテゴリを作成

        Args:
            session: データベースセッション
            category_data: カテゴリ作成データ

        Returns:
            作成されたカテゴリ情報

        Raises:
            HTTPException: カテゴリIDが既に存在する場合
        """
        # IDの重複チェック
        stmt = select(Category).where(Category.id == category_data.id)
        existing = (await session.execute(stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Category ID already exists")

        category = Category(**category_data.model_dump())
        session.add(category)
        await session.commit()
        await session.refresh(category)

        return CategoryRead.model_validate(category)

    @staticmethod
    async def update_category(
        session: AsyncSession,
        id: str,
        category_data: CategoryUpdate,
    ) -> CategoryRead:
        """カテゴリを更新

        Args:
            session: データベースセッション
            id: カテゴリID
            category_data: カテゴリ更新データ

        Returns:
            更新されたカテゴリ情報

        Raises:
            HTTPException: カテゴリが見つからない場合
        """
        stmt = select(Category).where(Category.id == id)
        category = (await session.execute(stmt)).scalar_one_or_none()

        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")

        # 提供されたフィールドのみ更新
        for field, value in category_data.model_dump(exclude_unset=True).items():
            setattr(category, field, value)

        await session.commit()
        await session.refresh(category)

        return CategoryRead.model_validate(category)

    @staticmethod
    async def delete_category(session: AsyncSession, id: str) -> None:
        """カテゴリを削除（論理削除）

        Args:
            session: データベースセッション
            id: カテゴリID

        Raises:
            HTTPException: カテゴリが見つからない場合
        """
        stmt = select(Category).where(Category.id == id)
        category = (await session.execute(stmt)).scalar_one_or_none()

        if category is None:
            raise HTTPException(status_code=404, detail="Category not found")

        # 論理削除
        category.is_active = False
        await session.commit()
