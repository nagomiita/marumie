from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..models import Category
from ..schemas import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead], operation_id="list_categories")
async def list_categories(
    type: str | None = None,
    is_active: bool = True,
    session: AsyncSession = Depends(get_db_session),
) -> list[CategoryRead]:
    """カテゴリ一覧を取得

    Args:
        type: フィルタする種別 ("income" | "expense")
        is_active: 有効なカテゴリのみ取得するか
    """
    query = select(Category)

    if type:
        query = query.where(Category.type == type)

    if is_active:
        query = query.where(Category.is_active)

    query = query.order_by(Category.display_order, Category.id)

    result = await session.execute(query)
    categories = result.scalars().all()

    return [CategoryRead.model_validate(cat) for cat in categories]


@router.get("/{id}", response_model=CategoryRead, operation_id="get_category")
async def get_category(
    id: str, session: AsyncSession = Depends(get_db_session)
) -> CategoryRead:
    """カテゴリをIDで取得"""
    stmt = select(Category).where(Category.id == id)
    category = (await session.execute(stmt)).scalar_one_or_none()

    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    return CategoryRead.model_validate(category)


@router.post(
    "", response_model=CategoryRead, status_code=201, operation_id="create_category"
)
async def create_category(
    category_data: CategoryCreate,
    session: AsyncSession = Depends(get_db_session),
) -> CategoryRead:
    """新規カテゴリを作成"""
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


@router.patch("/{id}", response_model=CategoryRead, operation_id="update_category")
async def update_category(
    id: str,
    category_data: CategoryUpdate,
    session: AsyncSession = Depends(get_db_session),
) -> CategoryRead:
    """カテゴリを更新"""
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


@router.delete("/{id}", status_code=204, operation_id="delete_category")
async def delete_category(
    id: str, session: AsyncSession = Depends(get_db_session)
) -> None:
    """カテゴリを削除（論理削除）"""
    stmt = select(Category).where(Category.id == id)
    category = (await session.execute(stmt)).scalar_one_or_none()

    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    # 論理削除
    category.is_active = False
    await session.commit()
