from __future__ import annotations

from datetime import date
from decimal import Decimal
from pathlib import Path

from sqlalchemy import Date, Enum, ForeignKey, Index, Numeric, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from ..base import DB_SCHEMA, AbstractTableClass
from ..enums import EnumPersonalTransactionType
from ..mixins import TimestampMixin, UUIDIdMixin


class PersonalTransaction(AbstractTableClass):
    """PersonalTransactionテーブル定義"""

    __tablename__ = Path(__file__).stem
    __table_args__ = (
        Index(
            "ix_personal_transactions_org_date", "organization_id", text("date DESC")
        ),
        Index("ix_personal_transactions_category_type", "category", "type"),
        {"schema": DB_SCHEMA, "comment": "個人取引"},
    )

    class Columns(UUIDIdMixin, TimestampMixin):
        """カラム定義"""

        date: Mapped[date] = mapped_column(Date, nullable=False, comment="取引日")
        category: Mapped[str] = mapped_column(
            String(255), nullable=False, comment="カテゴリ"
        )
        subcategory: Mapped[str | None] = mapped_column(
            String(255), nullable=True, name="subcategory", comment="サブカテゴリ"
        )
        amount: Mapped[Decimal] = mapped_column(
            Numeric(15, 2), nullable=False, comment="金額"
        )
        type: Mapped[EnumPersonalTransactionType] = mapped_column(
            Enum(
                EnumPersonalTransactionType,
                name="personal_transaction_type",
                values_callable=lambda x: [e.value for e in x],
            ),
            nullable=False,
            name="type",
            comment="取引種別",
        )
        payment_method: Mapped[str] = mapped_column(
            String(255), nullable=False, name="payment_method", comment="支払い方法"
        )
        description: Mapped[str] = mapped_column(Text, nullable=False, comment="説明")
        memo: Mapped[str | None] = mapped_column(Text, nullable=True, comment="メモ")
        hash: Mapped[str] = mapped_column(
            String(255),
            nullable=False,
            default="",
            server_default="",
            name="hash",
            comment="ハッシュ値",
        )
        organization_id: Mapped[str | None] = mapped_column(
            String(36),
            ForeignKey(f"{DB_SCHEMA}.organizations.id", ondelete="CASCADE"),
            nullable=True,
            name="organization_id",
            comment="組織ID",
        )

        def __repr__(self) -> str:
            return f"<PersonalTransaction(id={self.id}, date={self.date}, amount={self.amount})>"
