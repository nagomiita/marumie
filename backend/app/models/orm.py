"""
ORM 拡張クラス定義

各テーブルクラスを継承し、リレーションシップ、ハイブリッドプロパティ、
カスタムメソッドなどを定義します。
テーブル定義とビジネスロジックを分離することで、保守性を向上させます。
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, relationship

from .tables import categories, organizations, personal_transactions, users

if TYPE_CHECKING:
    pass


class User(users.User):
    """ユーザーモデル（ORM拡張）"""

    # リレーションシップ
    organizations: Mapped[list[Organization]] = relationship(
        "Organization",
        back_populates="user",
    )


class Organization(organizations.Organization):
    """組織モデル（ORM拡張）"""

    # リレーションシップ
    user: Mapped[User | None] = relationship(
        "User",
        back_populates="organizations",
    )
    personal_transactions: Mapped[list[PersonalTransaction]] = relationship(
        "PersonalTransaction",
        back_populates="organization",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class PersonalTransaction(personal_transactions.PersonalTransaction):
    """個人取引モデル（ORM拡張）"""

    # リレーションシップ
    organization: Mapped[Organization | None] = relationship(
        "Organization",
        back_populates="personal_transactions",
    )


class Category(categories.Category):
    """カテゴリモデル（ORM拡張）"""

    # 現時点ではリレーションシップなし
    # 将来的にハイブリッドプロパティやカスタムメソッドを追加可能
    pass
