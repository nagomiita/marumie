"""Initial schema from Prisma models"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "202411020001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role_enum = sa.Enum("admin", "user", name="user_role")
    organization_type_enum = sa.Enum("household", "business", "nonprofit", "other", name="organization_type")
    transaction_type_enum = sa.Enum(
        "income", "expense", "non_cash_journal", "offset_income", "offset_expense", name="transaction_type"
    )
    personal_transaction_type_enum = sa.Enum("income", "expense", name="personal_transaction_type")

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("auth_id", sa.String(length=255), nullable=False, unique=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("role", user_role_enum, nullable=False, server_default="user"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "political_organizations",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("org_name", sa.String(length=255), nullable=True),
        sa.UniqueConstraint("slug", name="uq_political_organizations_slug"),
    )

    op.create_table(
        "organizations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("type", organization_type_enum, nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("settings", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("slug", name="uq_organizations_slug"),
        sa.Index("ix_organizations_user_id_type", "user_id", "type"),
    )

    op.create_table(
        "transactions",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column(
            "political_organization_id",
            sa.BigInteger,
            sa.ForeignKey("political_organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("transaction_no", sa.String(length=255), nullable=False),
        sa.Column("transaction_date", sa.Date, nullable=False),
        sa.Column("financial_year", sa.Integer, nullable=False),
        sa.Column("transaction_type", transaction_type_enum, nullable=False),
        sa.Column("debit_account", sa.String(length=255), nullable=False),
        sa.Column("debit_sub_account", sa.String(length=255), nullable=True),
        sa.Column("debit_department", sa.String(length=255), nullable=True),
        sa.Column("debit_partner", sa.String(length=255), nullable=True),
        sa.Column("debit_tax_category", sa.String(length=255), nullable=True),
        sa.Column("debit_amount", sa.Numeric(15, 2), nullable=False),
        sa.Column("credit_account", sa.String(length=255), nullable=False),
        sa.Column("credit_sub_account", sa.String(length=255), nullable=True),
        sa.Column("credit_department", sa.String(length=255), nullable=True),
        sa.Column("credit_partner", sa.String(length=255), nullable=True),
        sa.Column("credit_tax_category", sa.String(length=255), nullable=True),
        sa.Column("credit_amount", sa.Numeric(15, 2), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("memo", sa.Text, nullable=True),
        sa.Column("friendly_category", sa.String(length=255), nullable=True),
        sa.Column("category_key", sa.String(length=255), nullable=False),
        sa.Column("label", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("hash", sa.String(length=255), nullable=False, server_default=""),
        sa.UniqueConstraint("political_organization_id", "transaction_no", name="uq_transactions_org_txn_no"),
        sa.Index(
            "ix_transactions_org_year_type_date",
            "political_organization_id",
            "financial_year",
            "transaction_type",
            sa.text("transaction_date DESC"),
        ),
    )

    op.create_table(
        "personal_transactions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("category", sa.String(length=255), nullable=False),
        sa.Column("subcategory", sa.String(length=255), nullable=True),
        sa.Column("amount", sa.Numeric(15, 2), nullable=False),
        sa.Column("type", personal_transaction_type_enum, nullable=False),
        sa.Column("payment_method", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("memo", sa.Text, nullable=True),
        sa.Column("hash", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("organization_id", sa.String(length=36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True),
        sa.Index("ix_personal_transactions_org_date", "organization_id", sa.text("date DESC")),
        sa.Index("ix_personal_transactions_category_type", "category", "type"),
    )

    op.create_table(
        "balance_snapshots",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column(
            "political_organization_id",
            sa.BigInteger,
            sa.ForeignKey("political_organizations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("snapshot_date", sa.Date, nullable=False),
        sa.Column("balance", sa.Numeric(15, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Index(
            "ix_balance_snapshots_org_date_updated",
            "political_organization_id",
            sa.text("snapshot_date DESC"),
            sa.text("updated_at DESC"),
        ),
    )


def downgrade() -> None:
    op.drop_table("balance_snapshots")
    op.drop_table("personal_transactions")
    op.drop_table("transactions")
    op.drop_table("organizations")
    op.drop_table("political_organizations")
    op.drop_table("users")

    personal_transaction_type_enum = sa.Enum("income", "expense", name="personal_transaction_type")
    transaction_type_enum = sa.Enum(
        "income", "expense", "non_cash_journal", "offset_income", "offset_expense", name="transaction_type"
    )
    organization_type_enum = sa.Enum("household", "business", "nonprofit", "other", name="organization_type")
    user_role_enum = sa.Enum("admin", "user", name="user_role")

    personal_transaction_type_enum.drop(op.get_bind(), checkfirst=True)
    transaction_type_enum.drop(op.get_bind(), checkfirst=True)
    organization_type_enum.drop(op.get_bind(), checkfirst=True)
    user_role_enum.drop(op.get_bind(), checkfirst=True)
