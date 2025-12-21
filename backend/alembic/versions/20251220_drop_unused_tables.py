"""drop unused tables

Revision ID: 20251220_drop_unused
Revises: 202411020001
Create Date: 2025-12-20 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20251220_drop_unused"
down_revision: Union[str, None] = "202411020001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop unused tables
    op.drop_table("balance_snapshots")
    op.drop_table("transactions")
    op.drop_table("political_organizations")

    # Drop unused enum
    op.execute("DROP TYPE IF EXISTS transaction_type")


def downgrade() -> None:
    # Recreate transaction_type enum
    transaction_type_enum = sa.Enum(
        "income",
        "expense",
        "non_cash_journal",
        "offset_income",
        "offset_expense",
        name="transaction_type",
    )
    transaction_type_enum.create(op.get_bind())

    # Recreate political_organizations table
    op.create_table(
        "political_organizations",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("org_name", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint("slug", name="uq_political_organizations_slug"),
    )

    # Recreate transactions table
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
        sa.Column(
            "created_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("memo", sa.Text, nullable=True),
        sa.Column("friendly_category", sa.String(length=255), nullable=True),
        sa.Column("category_key", sa.String(length=255), nullable=False),
        sa.Column("label", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("hash", sa.String(length=255), nullable=False, server_default=""),
        sa.UniqueConstraint(
            "political_organization_id",
            "transaction_no",
            name="uq_transactions_org_txn_no",
        ),
        sa.Index(
            "ix_transactions_org_year_type_date",
            "political_organization_id",
            "financial_year",
            "transaction_type",
            sa.text("transaction_date DESC"),
        ),
    )

    # Recreate balance_snapshots table
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
        sa.Column(
            "created_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Index(
            "ix_balance_snapshots_org_date_updated",
            "political_organization_id",
            sa.text("snapshot_date DESC"),
            sa.text("updated_at DESC"),
        ),
    )
