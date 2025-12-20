from __future__ import annotations

from sqlalchemy import JSON, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..base import Base
from ..enums import EnumOrganizationType
from ..mixins import TimestampMixin, UUIDIdMixin


class Organization(UUIDIdMixin, TimestampMixin, Base):
    """組織テーブル"""

    name: Mapped[str] = mapped_column(String(255), nullable=False, comment="組織名")
    display_name: Mapped[str] = mapped_column(
        String(255), nullable=False, name="display_name", comment="表示名"
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="説明")
    type: Mapped[EnumOrganizationType] = mapped_column(
        Enum(
            EnumOrganizationType,
            name="organization_type",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        comment="組織タイプ",
    )
    slug: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, comment="スラッグ"
    )
    user_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        name="user_id",
        comment="ユーザーID",
    )
    settings: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, name="settings", comment="設定"
    )

    __table_args__ = (Index("ix_organizations_user_id_type", "user_id", "type"),)

    def __repr__(self) -> str:
        return f"<Organization(id={self.id}, name={self.name}, type={self.type})>"
