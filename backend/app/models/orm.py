"""
ORM 拡張: リレーションシップ定義

テーブル定義（tables/）とは分離し、リレーションシップのみを定義します。
各テーブルクラスに直接リレーションシップを追加します。
"""

from __future__ import annotations

from sqlalchemy.orm import relationship

from .tables import categories as categories_module
from .tables import organizations as organizations_module
from .tables import personal_transactions as personal_transactions_module
from .tables import users as users_module

# テーブルクラスにリレーションシップを追加
users_module.User.organizations = relationship(
    "Organization",
    back_populates="user",
)

organizations_module.Organization.user = relationship(
    "User",
    back_populates="organizations",
)
organizations_module.Organization.personal_transactions = relationship(
    "PersonalTransaction",
    back_populates="organization",
    cascade="all, delete-orphan",
    passive_deletes=True,
)

personal_transactions_module.PersonalTransaction.organization = relationship(
    "Organization",
    back_populates="personal_transactions",
)

# エクスポート（型ヒントのため）
User = users_module.User
Organization = organizations_module.Organization
PersonalTransaction = personal_transactions_module.PersonalTransaction
Category = categories_module.Category
