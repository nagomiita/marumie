from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import (
    JSON,
    Date,
    Enum,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .enums import OrganizationType, PersonalTransactionType, UserRole
from .mixins import TimestampMixin, UUIDIdMixin


class User(UUIDIdMixin, TimestampMixin, Base):
    __tablename__ = "users"

    auth_id: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, name="auth_id"
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole, name="user_role", values_callable=lambda x: [e.value for e in x]
        ),
        nullable=False,
        default=UserRole.USER,
        server_default="user",
    )

    organizations: Mapped[list[Organization]] = relationship(back_populates="user")


class Organization(UUIDIdMixin, TimestampMixin, Base):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(
        String(255), nullable=False, name="display_name"
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[OrganizationType] = mapped_column(
        Enum(
            OrganizationType,
            name="organization_type",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), name="user_id"
    )
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True, name="settings")

    user: Mapped[User | None] = relationship(back_populates="organizations")
    personal_transactions: Mapped[list[PersonalTransaction]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (Index("ix_organizations_user_id_type", "user_id", "type"),)


class PersonalTransaction(UUIDIdMixin, TimestampMixin, Base):
    __tablename__ = "personal_transactions"

    date: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    subcategory: Mapped[str | None] = mapped_column(
        String(255), nullable=True, name="subcategory"
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    type: Mapped[PersonalTransactionType] = mapped_column(
        Enum(
            PersonalTransactionType,
            name="personal_transaction_type",
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        name="type",
    )
    payment_method: Mapped[str] = mapped_column(
        String(255), nullable=False, name="payment_method"
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    memo: Mapped[str | None] = mapped_column(Text, nullable=True)
    hash: Mapped[str] = mapped_column(
        String(255), nullable=False, default="", server_default="", name="hash"
    )
    organization_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=True,
        name="organization_id",
    )

    organization: Mapped[Organization | None] = relationship(
        back_populates="personal_transactions"
    )

    __table_args__ = (
        Index(
            "ix_personal_transactions_org_date", "organization_id", text("date DESC")
        ),
        Index("ix_personal_transactions_category_type", "category", "type"),
    )
