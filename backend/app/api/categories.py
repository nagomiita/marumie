from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.db import get_db_session
from ..schemas import CategoryCreate, CategoryRead, CategoryUpdate
from ..services import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead], operation_id="list_categories")
async def list_categories(
    type: str | None = None,
    is_active: bool | None = None,
    session: AsyncSession = Depends(get_db_session),
) -> list[CategoryRead]:
    """カテゴリ一覧を取得

    Args:
        type: フィルタする種別 ("income" | "expense")
        is_active: 有効なカテゴリのみ取得するか（Noneの場合は全て取得）
    """
    return await CategoryService.list_categories(session, type, is_active)


@router.get("/{id}", response_model=CategoryRead, operation_id="get_category")
async def get_category(
    id: str, session: AsyncSession = Depends(get_db_session)
) -> CategoryRead:
    """カテゴリをIDで取得"""
    return await CategoryService.get_category(session, id)


@router.post(
    "", response_model=CategoryRead, status_code=201, operation_id="create_category"
)
async def create_category(
    category_data: CategoryCreate,
    session: AsyncSession = Depends(get_db_session),
) -> CategoryRead:
    """新規カテゴリを作成"""
    return await CategoryService.create_category(session, category_data)


@router.patch("/{id}", response_model=CategoryRead, operation_id="update_category")
async def update_category(
    id: str,
    category_data: CategoryUpdate,
    session: AsyncSession = Depends(get_db_session),
) -> CategoryRead:
    """カテゴリを更新"""
    return await CategoryService.update_category(session, id, category_data)


@router.delete("/{id}", status_code=204, operation_id="delete_category")
async def delete_category(
    id: str, session: AsyncSession = Depends(get_db_session)
) -> None:
    """カテゴリを削除（論理削除）"""
    await CategoryService.delete_category(session, id)
