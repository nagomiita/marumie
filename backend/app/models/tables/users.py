from __future__ import annotations

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from ..base import Base
from ..enums import EnumUserRole
from ..mixins import TimestampMixin, UUIDIdMixin


class User(UUIDIdMixin, TimestampMixin, Base):
    """ユーザーテーブル"""

    auth_id: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, name="auth_id", comment="認証ID"
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, comment="メールアドレス"
    )
    role: Mapped[EnumUserRole] = mapped_column(
        Enum(
            EnumUserRole,
            name="user_role",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=EnumUserRole.USER,
        server_default="user",
        comment="ユーザーロール",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
