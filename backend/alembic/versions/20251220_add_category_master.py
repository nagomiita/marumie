"""
カテゴリマスタテーブル追加マイグレーション

Revision ID: 20251220_add_category_master
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251220_add_category_master'
down_revision = '20251220_drop_unused'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # カテゴリマスタテーブルを作成
    op.create_table(
        'categories',
        sa.Column('id', sa.String(100), primary_key=True, nullable=False, comment='カテゴリID（主キー・一意識別子）'),
        sa.Column('name', sa.String(255), nullable=False, comment='カテゴリ名'),
        sa.Column('group', sa.String(255), nullable=False, comment='カテゴリグループ（大分類）'),
        sa.Column('color', sa.String(20), nullable=False, comment='表示色（HEXコード）'),
        sa.Column('short_label', sa.String(100), nullable=False, comment='短縮ラベル'),
        sa.Column('type', sa.Enum('income', 'expense', name='category_type'), nullable=False, comment='種別（収入/支出）'),
        sa.Column('display_order', sa.Integer, nullable=False, default=999, comment='表示順序'),
        sa.Column('is_active', sa.Boolean, nullable=False, default=True, server_default='true', comment='有効フラグ'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    )

    # インデックス作成
    op.create_index('ix_categories_type', 'categories', ['type'])
    op.create_index('ix_categories_name', 'categories', ['name'])
    op.create_index('ix_categories_display_order', 'categories', ['display_order'])

    # 初期データ投入（TypeScriptのcategory-mapping.tsから変換）
    categories_data = [
        # 収入項目
        ('salary', '給与', '収入', '#059669', '給与', 'income', 10),
        ('bonus', '賞与', '収入', '#0891B2', '賞与', 'income', 20),
        ('side-income', '副業', '収入', '#EA580C', '副業', 'income', 30),
        ('investment-income', '投資収益', '収入', '#DC2626', '投資収益', 'income', 40),
        ('extra-income', '臨時収入', '収入', '#65A30D', '臨時収入', 'income', 50),
        ('misc-income', 'その他収入', '収入', '#D97706', 'その他収入', 'income', 60),
        ('other-income', 'その他', '収入', '#6B7280', 'その他', 'income', 70),
        
        # 支出項目 - 固定費
        ('rent', '家賃', '固定費', '#0369A1', '家賃', 'expense', 110),
        ('mortgage', '住宅ローン', '固定費', '#1E40AF', '住宅ローン', 'expense', 120),
        ('utilities', '光熱費', '固定費', '#126C81', '光熱費', 'expense', 130),
        ('communication', '通信費', '固定費', '#6D28D9', '通信費', 'expense', 140),
        ('insurance', '保険', '固定費', '#047857', '保険', 'expense', 150),
        ('subscription', 'サブスク', '固定費', '#7C3AED', 'サブスク', 'expense', 160),
        
        # 支出項目 - 変動費
        ('food', '食費', '変動費', '#DC2626', '食費', 'expense', 210),
        ('dining', '外食', '変動費', '#EA580C', '外食', 'expense', 220),
        ('daily-necessities', '日用品', '変動費', '#4D7C0F', '日用品', 'expense', 230),
        ('transportation', '交通費', '変動費', '#0891B2', '交通費', 'expense', 240),
        ('travel', '旅費', '変動費', '#0E7490', '旅費', 'expense', 250),
        ('medical', '医療', '変動費', '#BE185D', '医療', 'expense', 260),
        ('clothing', '衣服', '変動費', '#DB2777', '衣服', 'expense', 270),
        ('beauty', '美容', '変動費', '#EC4899', '美容', 'expense', 280),
        ('education', '教育', '変動費', '#3856B1', '教育', 'expense', 290),
        ('entertainment', '娯楽', '変動費', '#C2410C', '娯楽', 'expense', 300),
        ('social', '交際費', '変動費', '#A16207', '交際費', 'expense', 310),
        
        # 支出項目 - その他
        ('credit-card', 'クレジットカード', '決済', '#059669', 'カード', 'expense', 410),
        ('cash', '現金', '決済', '#0D9488', '現金', 'expense', 420),
        ('savings', '貯金', '貯蓄・投資', '#65A30D', '貯金', 'expense', 510),
        ('investment', '投資', '貯蓄・投資', '#65A30D', '投資', 'expense', 520),
        ('other-expenses', 'その他', 'その他', '#334155', 'その他', 'expense', 910),
    ]

    op.bulk_insert(
        sa.table(
            'categories',
            sa.column('id', sa.String),
            sa.column('name', sa.String),
            sa.column('group', sa.String),
            sa.column('color', sa.String),
            sa.column('short_label', sa.String),
            sa.column('type', postgresql.ENUM('income', 'expense', name='category_type')),
            sa.column('display_order', sa.Integer),
        ),
        [
            {
                'id': id_,
                'name': name,
                'group': group,
                'color': color,
                'short_label': short_label,
                'type': type_,
                'display_order': display_order
            }
            for id_, name, group, color, short_label, type_, display_order in categories_data
        ]
    )


def downgrade() -> None:
    op.drop_index('ix_categories_display_order', table_name='categories')
    op.drop_index('ix_categories_name', table_name='categories')
    op.drop_index('ix_categories_type', table_name='categories')
    op.drop_table('categories')
    op.execute('DROP TYPE IF EXISTS category_type')
