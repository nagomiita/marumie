"""rename personal_transactions to transactions

Revision ID: 20251220_rename_transactions
Revises: 20251220_add_category_master
Create Date: 2025-12-20

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '20251220_rename_transactions'
down_revision = '20251220_add_category_master'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # テーブル名をリネーム
    op.rename_table('personal_transactions', 'transactions')
    
    # インデックス名をリネーム
    op.execute('ALTER INDEX ix_personal_transactions_org_date RENAME TO ix_transactions_org_date')
    op.execute('ALTER INDEX ix_personal_transactions_category_type RENAME TO ix_transactions_category_type')
    
    # ENUM型をリネーム
    op.execute('ALTER TYPE personal_transaction_type RENAME TO transaction_type')


def downgrade() -> None:
    # ENUM型をリネーム
    op.execute('ALTER TYPE transaction_type RENAME TO personal_transaction_type')
    
    # インデックス名をリネーム
    op.execute('ALTER INDEX ix_transactions_category_type RENAME TO ix_personal_transactions_category_type')
    op.execute('ALTER INDEX ix_transactions_org_date RENAME TO ix_personal_transactions_org_date')
    
    # テーブル名をリネーム
    op.rename_table('transactions', 'personal_transactions')
