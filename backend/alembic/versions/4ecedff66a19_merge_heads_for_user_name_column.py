

"""
Revision ID: 4ecedff66a19
Revises: 20251220_add_name_to_user, 20251220_rename_transactions
Create Date: 2025-12-20 21:18:12.801206

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4ecedff66a19'
down_revision = ('20251220_add_name_to_user', '20251220_rename_transactions')
branch_labels = None
depends_on = None


def upgrade():
    pass

def downgrade():
    pass
