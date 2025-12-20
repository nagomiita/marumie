"""
add name column to user table
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251220_add_name_to_user'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('name', sa.String(length=255), nullable=False, comment='表示名'), schema='public')

def downgrade():
    op.drop_column('users', 'name', schema='public')
