from __future__ import annotations

from datetime import datetime

from .base import BaseSchema


class CategoryRead(BaseSchema):
    """カテゴリマスタのレスポンススキーマ"""

    id: str
    name: str
    subcategory: str | None
    color: str
    short_label: str
    type: str  # "income" | "expense"
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CategoryCreate(BaseSchema):
    """カテゴリマスタの作成スキーマ"""

    id: str
    name: str
    subcategory: str | None = None
    color: str
    short_label: str
    type: str  # "income" | "expense"
    display_order: int = 999
    is_active: bool = True


class CategoryUpdate(BaseSchema):
    """カテゴリマスタの更新スキーマ"""

    name: str | None = None
    subcategory: str | None = None
    color: str | None = None
    short_label: str | None = None
    display_order: int | None = None
    is_active: bool | None = None
