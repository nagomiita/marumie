from __future__ import annotations

from pathlib import Path

from sqlalchemy import Boolean, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..base import DB_SCHEMA, AbstractTableClass
from ..enums import EnumCategoryType
from ..mixins import TimestampMixin


class Category(AbstractTableClass):
    """
    Categoryテーブル定義

    収入・支出のカテゴリ分類を管理する正規化されたマスタテーブル。
    TypeScriptのcategory-mapping.tsと同期してデータを保持。
    """

    __tablename__ = Path(__file__).stem
    __table_args__ = {"schema": DB_SCHEMA, "comment": "カテゴリマスタ"}

    class Columns(TimestampMixin):
        """カラム定義"""

        id: Mapped[str] = mapped_column(
            String(100),
            primary_key=True,
            nullable=False,
            comment="カテゴリID（主キー・一意識別子）",
        )
        name: Mapped[str] = mapped_column(
            String(255), nullable=False, comment="カテゴリ名"
        )
        group: Mapped[str] = mapped_column(
            String(255), nullable=False, comment="カテゴリグループ（大分類）"
        )
        color: Mapped[str] = mapped_column(
            String(20), nullable=False, comment="表示色（HEXコード）"
        )
        short_label: Mapped[str] = mapped_column(
            String(100), nullable=False, comment="短縮ラベル"
        )
        type: Mapped[EnumCategoryType] = mapped_column(
            Enum(
                EnumCategoryType,
                name="category_type",
                values_callable=lambda x: [e.value for e in x],
            ),
            nullable=False,
            comment="種別（収入/支出）",
        )
        display_order: Mapped[int] = mapped_column(
            Integer, nullable=False, default=999, comment="表示順序"
        )
        is_active: Mapped[bool] = mapped_column(
            Boolean,
            nullable=False,
            default=True,
            server_default="true",
            comment="有効フラグ",
        )

        def __repr__(self) -> str:
            return f"<Category(id={self.id}, name={self.name}, type={self.type})>"
