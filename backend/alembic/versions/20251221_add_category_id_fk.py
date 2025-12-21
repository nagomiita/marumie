"""add category_id FK to transactions

Revision ID: 20251221_add_category_id_fk
Revises: 4ecedff66a19
Create Date: 2025-12-21

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251221_add_category_id_fk'
down_revision = '4ecedff66a19'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop existing index on category/type if exists
    try:
        op.drop_index('ix_transactions_category_type', table_name='transactions')
    except Exception:
        pass

    # Step 1: Add new nullable column `category_id` (temporarily nullable)
    op.add_column('transactions', sa.Column('category_id', sa.String(length=100), nullable=True))

    # Step 2: Populate category_id by matching existing category values
    # 1) If transactions.category already stores a category id, use it
    # 2) Otherwise try to match transactions.category to categories.name
    conn = op.get_bind()

    # Update where category matches categories.id
    conn.execute(sa.text(
        """
        UPDATE transactions
        SET category_id = c.id
        FROM categories c
        WHERE transactions.category = c.id
        """
    ))

    # Update where category matches categories.name and category_id still null
    conn.execute(sa.text(
        """
        UPDATE transactions
        SET category_id = c.id
        FROM categories c
        WHERE transactions.category = c.name
          AND transactions.category_id IS NULL
        """
    ))

    # Step 3: For any remaining rows where category_id is still null,
    # set to a default "uncategorized" category
    # First, ensure an "uncategorized" category exists
    conn.execute(sa.text(
        """
        INSERT INTO categories (id, name, "group", color, short_label, type, display_order)
        VALUES ('uncategorized', 'uncategorized', 'その他', '#999999', '未分類', 'expense', 999)
        ON CONFLICT (id) DO NOTHING
        """
    ))

    # Set remaining null category_id to uncategorized
    conn.execute(sa.text(
        """
        UPDATE transactions
        SET category_id = 'uncategorized'
        WHERE category_id IS NULL
        """
    ))

    # Step 4: Now make the column NOT NULL
    op.alter_column('transactions', 'category_id', nullable=False)

    # Step 5: Add foreign key constraint with RESTRICT to prevent deletion of categories in use
    op.create_foreign_key(
        'fk_transactions_category_id_categories',
        'transactions',
        'categories',
        ['category_id'],
        ['id'],
        ondelete='RESTRICT',
    )

    # Step 6: Create index on category_id and type
    op.create_index('ix_transactions_category_type', 'transactions', ['category_id', 'type'])

    # Step 7: Drop the old `category` column (no longer needed)
    op.drop_column('transactions', 'category')


def downgrade() -> None:
    # Restore the old `category` column first
    op.add_column('transactions', sa.Column('category', sa.String(length=255), nullable=True))

    # Populate category from category_id
    conn = op.get_bind()
    conn.execute(sa.text(
        """
        UPDATE transactions
        SET category = category_id
        """
    ))

    # Make category NOT NULL again
    op.alter_column('transactions', 'category', nullable=False)

    # Drop new index
    try:
        op.drop_index('ix_transactions_category_type', table_name='transactions')
    except Exception:
        pass

    # Drop foreign key
    try:
        op.drop_constraint('fk_transactions_category_id_categories', 'transactions', type_='foreignkey')
    except Exception:
        pass

    # Drop the category_id column
    op.drop_column('transactions', 'category_id')

    # Restore index on original `category` column
    try:
        op.create_index('ix_transactions_category_type', 'transactions', ['category', 'type'])
    except Exception:
        pass
