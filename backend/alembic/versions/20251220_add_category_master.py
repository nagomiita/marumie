"""
カテゴリマスタテーブル追加マイグレーション

Revision ID: 20251220_add_category_master
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251220_add_category_master'
down_revision = None  # 最新のマイグレーションIDに置き換えてください
branch_labels = None
depends_on = None


def upgrade() -> None:
    # カテゴリマスタテーブルを作成
    op.create_table(
        'categories',
        sa.Column('id', sa.String(100), primary_key=True, nullable=False, comment='カテゴリID（主キー・一意識別子）'),
        sa.Column('name', sa.String(255), nullable=False, comment='カテゴリ名'),
        sa.Column('subcategory', sa.String(255), nullable=True, comment='サブカテゴリ名'),
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
        ('salary', '収入', '給与', '#059669', '給与', 'income', 10),
        ('bonus', '収入', '賞与', '#0891B2', '賞与', 'income', 20),
        ('side-income', '収入', '副業', '#EA580C', '副業', 'income', 30),
        ('investment-income', '収入', '投資収益', '#DC2626', '投資収益', 'income', 40),
        ('extra-income', '収入', '臨時収入', '#65A30D', '臨時収入', 'income', 50),
        ('misc-income', '収入', 'その他', '#D97706', 'その他収入', 'income', 60),
        ('other-income', '収入', 'その他', '#6B7280', 'その他', 'income', 70),
        
        # 支出項目 - 固定費
        ('rent', '固定費', '住居費', '#0369A1', '家賃', 'expense', 110),
        ('mortgage', '固定費', '住居費', '#1E40AF', '住宅ローン', 'expense', 120),
        ('utilities', '固定費', '光熱費', '#126C81', '光熱費', 'expense', 130),
        ('communication', '固定費', '通信費', '#6D28D9', '通信費', 'expense', 140),
        ('insurance', '固定費', '保険', '#047857', '保険', 'expense', 150),
        ('subscription', '固定費', 'サブスク', '#7C3AED', 'サブスク', 'expense', 160),
        
        # 支出項目 - 変動費
        ('food', '変動費', '食費', '#DC2626', '食費', 'expense', 210),
        ('dining', '変動費', '外食', '#EA580C', '外食', 'expense', 220),
        ('daily-necessities', '変動費', '日用品', '#4D7C0F', '日用品', 'expense', 230),
        ('transportation', '変動費', '交通費', '#0891B2', '交通費', 'expense', 240),
        ('travel', '変動費', '旅行・交通', '#0E7490', '旅費', 'expense', 250),
        ('medical', '変動費', '医療・健康', '#BE185D', '医療', 'expense', 260),
        ('clothing', '変動費', '衣服・美容', '#DB2777', '衣服', 'expense', 270),
        ('beauty', '変動費', '美容', '#EC4899', '美容', 'expense', 280),
        ('education', '変動費', '教育', '#3856B1', '教育', 'expense', 290),
        ('entertainment', '変動費', '娯楽', '#C2410C', '娯楽', 'expense', 300),
        ('social', '変動費', '交際費', '#A16207', '交際費', 'expense', 310),
        
        # 支出項目 - その他
        ('credit-card', '決済', 'クレジットカード', '#059669', 'カード', 'expense', 410),
        ('cash', '決済', '現金', '#0D9488', '現金', 'expense', 420),
        ('savings', '貯蓄・投資', '貯金', '#65A30D', '貯金', 'expense', 510),
        ('investment', '貯蓄・投資', '投資', '#65A30D', '投資', 'expense', 520),
        ('other-expenses', 'その他', 'その他', '#334155', 'その他', 'expense', 910),
    ]

    op.bulk_insert(
        sa.table(
            'categories',
            sa.column('id', sa.String),
            sa.column('name', sa.String),
            sa.column('subcategory', sa.String),
            sa.column('color', sa.String),
            sa.column('short_label', sa.String),
            sa.column('type', sa.String),
            sa.column('display_order', sa.Integer),
        ),
        [
            {
                'id': key,
                'name': category,
                'subcategory': subcategory,
                'color': color,
                'short_label': short_label,
                'type': type_,
                'display_order': display_order
            }
            for key, category, subcategory, color, short_label, type_, display_order in categories_data
        ]
    )


def downgrade() -> None:
    op.drop_index('ix_categories_display_order', table_name='categories')
    op.drop_index('ix_categories_name', table_name='categories')
    op.drop_index('ix_categories_type', table_name='categories')
    op.drop_table('categories')
    op.execute('DROP TYPE IF EXISTS category_type')
