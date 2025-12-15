from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import (
    BigInteger,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .enums import OrganizationType, PersonalTransactionType, TransactionType, UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    auth_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, name="auth_id")
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), nullable=False, default=UserRole.user, server_default=UserRole.user.value
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), name="created_at"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now(), name="updated_at"
    )

    organizations: Mapped[list["Organization"]] = relationship(back_populates="user")


class PoliticalOrganization(Base):
    __tablename__ = "political_organizations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False, name="display_name")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), name="created_at"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now(), name="updated_at"
    )
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    org_name: Mapped[str | None] = mapped_column(String(255), nullable=True, name="org_name")

    balance_snapshots: Mapped[list["BalanceSnapshot"]] = relationship(
        back_populates="political_organization", cascade="all, delete-orphan", passive_deletes=True
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="political_organization", cascade="all, delete-orphan", passive_deletes=True
    )


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False, name="display_name")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[OrganizationType] = mapped_column(Enum(OrganizationType, name="organization_type"), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), name="user_id")
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True, name="settings")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), name="created_at"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now(), name="updated_at"
    )

    user: Mapped[User | None] = relationship(back_populates="organizations")
    personal_transactions: Mapped[list["PersonalTransaction"]] = relationship(
        back_populates="organization", cascade="all, delete-orphan", passive_deletes=True
    )

    __table_args__ = (
        Index("ix_organizations_user_id_type", "user_id", "type"),
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    political_organization_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("political_organizations.id", ondelete="CASCADE"), nullable=False, name="political_organization_id"
    )
    transaction_no: Mapped[str] = mapped_column(String(255), nullable=False, name="transaction_no")
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, name="transaction_date")
    financial_year: Mapped[int] = mapped_column(Integer, nullable=False, name="financial_year")
    transaction_type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType, name="transaction_type"), nullable=False, name="transaction_type"
    )
    debit_account: Mapped[str] = mapped_column(String(255), nullable=False, name="debit_account")
    debit_sub_account: Mapped[str | None] = mapped_column(String(255), nullable=True, name="debit_sub_account")
    debit_department: Mapped[str | None] = mapped_column(String(255), nullable=True, name="debit_department")
    debit_partner: Mapped[str | None] = mapped_column(String(255), nullable=True, name="debit_partner")
    debit_tax_category: Mapped[str | None] = mapped_column(String(255), nullable=True, name="debit_tax_category")
    debit_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, name="debit_amount")
    credit_account: Mapped[str] = mapped_column(String(255), nullable=False, name="credit_account")
    credit_sub_account: Mapped[str | None] = mapped_column(String(255), nullable=True, name="credit_sub_account")
    credit_department: Mapped[str | None] = mapped_column(String(255), nullable=True, name="credit_department")
    credit_partner: Mapped[str | None] = mapped_column(String(255), nullable=True, name="credit_partner")
    credit_tax_category: Mapped[str | None] = mapped_column(String(255), nullable=True, name="credit_tax_category")
    credit_amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False, name="credit_amount")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), name="created_at"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now(), name="updated_at"
    )
    memo: Mapped[str | None] = mapped_column(Text, nullable=True)
    friendly_category: Mapped[str | None] = mapped_column(String(255), nullable=True, name="friendly_category")
    category_key: Mapped[str] = mapped_column(String(255), nullable=False, name="category_key")
    label: Mapped[str] = mapped_column(String(255), nullable=False, default="", server_default="", name="label")
    hash: Mapped[str] = mapped_column(String(255), nullable=False, default="", server_default="", name="hash")

    political_organization: Mapped[PoliticalOrganization] = relationship(back_populates="transactions")

    __table_args__ = (
        UniqueConstraint("political_organization_id", "transaction_no", name="uq_transactions_org_txn_no"),
        Index(
            "ix_transactions_org_year_type_date",
            "political_organization_id",
            "financial_year",
            "transaction_type",
            transaction_date.desc(),
        ),
    )


class PersonalTransaction(Base):
    __tablename__ = "personal_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    date: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    subcategory: Mapped[str | None] = mapped_column(String(255), nullable=True, name="subcategory")
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    type: Mapped[PersonalTransactionType] = mapped_column(
        Enum(PersonalTransactionType, name="personal_transaction_type"), nullable=False, name="type"
    )
    payment_method: Mapped[str] = mapped_column(String(255), nullable=False, name="payment_method")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    memo: Mapped[str | None] = mapped_column(Text, nullable=True)
    hash: Mapped[str] = mapped_column(String(255), nullable=False, default="", server_default="", name="hash")
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), name="created_at"
    )
    updated_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now(), name="updated_at"
    )
    organization_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, name="organization_id"
    )

    organization: Mapped[Organization | None] = relationship(back_populates="personal_transactions")

    __table_args__ = (
        Index("ix_personal_transactions_org_date", "organization_id", text("date DESC")),
        Index("ix_personal_transactions_category_type", "category", "type"),
    )


class BalanceSnapshot(Base):
    __tablename__ = "balance_snapshots"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    political_organization_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("political_organizations.id", ondelete="CASCADE"), nullable=False, name="political_organization_id"
    )
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, name="snapshot_date")
    balance: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), name="created_at"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now(), name="updated_at"
    )

    political_organization: Mapped[PoliticalOrganization] = relationship(back_populates="balance_snapshots")

    __table_args__ = (
        Index(
            "ix_balance_snapshots_org_date_updated",
            "political_organization_id",
            text("snapshot_date DESC"),
            text("updated_at DESC"),
        ),
    )
