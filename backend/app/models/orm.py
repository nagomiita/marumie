"""
ORM 拡張: リレーションシップ・ハイブリッドプロパティ定義

テーブル定義（tables/）のColumns Mixinを継承し、以下を追加します：
- リレーションシップ
- ハイブリッドプロパティ（計算プロパティ）
- カスタムメソッド

各テーブルは Base + Table.Columns を多重継承します。
"""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, relationship

from .base import Base
from .tables import categories, organizations, transactions, users


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(Base, users.User.Columns):
    """Userテーブル（ORM拡張）"""

    __tablename__ = users.User.__tablename__
    __table_args__ = users.User.__table_args__

    # リレーションシップ
    organizations: Mapped[list[Organization]] = relationship(
        "Organization",
        back_populates="user",
    )


# ---------------------------------------------------------------------------
# Organization
# ---------------------------------------------------------------------------
class Organization(Base, organizations.Organization.Columns):
    """Organizationテーブル（ORM拡張）"""

    __tablename__ = organizations.Organization.__tablename__
    __table_args__ = organizations.Organization.__table_args__

    # リレーションシップ
    user: Mapped[User | None] = relationship(
        "User",
        back_populates="organizations",
    )
    transactions: Mapped[list[Transaction]] = relationship(
        "Transaction",
        back_populates="organization",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # ハイブリッドプロパティ
    @hybrid_property
    def transaction_count(self) -> int:
        """トランザクション数（インスタンスレベル）"""
        return len(self.transactions)

    @transaction_count.inplace.expression
    @classmethod
    def _transaction_count_expression(cls):
        """トランザクション数（クエリレベル）"""
        return (
            select(func.count(Transaction.id))
            .where(Transaction.organization_id == cls.id)
            .correlate_except(Transaction)
            .scalar_subquery()
        )


# ---------------------------------------------------------------------------
# Transaction
# ---------------------------------------------------------------------------
class Transaction(Base, transactions.Transaction.Columns):
    """Transactionテーブル（ORM拡張）"""

    __tablename__ = transactions.Transaction.__tablename__
    __table_args__ = transactions.Transaction.__table_args__

    # リレーションシップ
    organization: Mapped[Organization | None] = relationship(
        "Organization",
        back_populates="transactions",
    )

    # ハイブリッドプロパティ
    @hybrid_property
    def amount_abs(self) -> Decimal:
        """金額の絶対値（インスタンスレベル）"""
        return abs(self.amount)

    @amount_abs.inplace.expression
    @classmethod
    def _amount_abs_expression(cls):
        """金額の絶対値（クエリレベル）"""
        return func.abs(cls.amount)


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------
class Category(Base, categories.Category.Columns):
    """Categoryテーブル（ORM拡張）"""

    __tablename__ = categories.Category.__tablename__
    __table_args__ = categories.Category.__table_args__

    # 現時点では拡張なし
    pass


# ---------------------------------------------------------------------------
# エクスポート
# ---------------------------------------------------------------------------
__all__ = [
    "User",
    "Organization",
    "Transaction",
    "Category",
]
