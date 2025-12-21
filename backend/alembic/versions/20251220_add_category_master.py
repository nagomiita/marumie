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

    # 初期データ投入（config.public.jsonと一致させる）
    categories_data = [
        # 収入項目（明るい緑・青系）
        ('salary', '給与収入', '収入', '#A7F3D0', '給与', 'income', 10),      # 明るいエメラルド
        ('bonus', '賞与', '収入', '#BAE6FD', '賞与', 'income', 20),            # 明るいスカイブルー
        ('misc_income', '雑収入', '収入', '#FDE68A', '雑収入', 'income', 60),  # 明るいイエロー

        # 支出項目 - 固定費（青・紫系）
        ('rent', '家賃', '固定費', '#BFDBFE', '家賃', 'expense', 110),              # ライトブルー（住まい）
        ('utilities', '水道光熱費', '固定費', '#A5F3FC', '光熱費', 'expense', 130),  # シアン（水・電気）
        ('communication', '通信費', '固定費', '#DDD6FE', '通信費', 'expense', 140),  # ラベンダー（通信）
        ('insurance', '保険料', '固定費', '#D1FAE5', '保険', 'expense', 150),        # ミントグリーン（保護）
        ('subscription', 'サブスクリプション', '固定費', '#E9D5FF', 'サブスク', 'expense', 160),  # 明るいパープル

        # 支出項目 - 変動費（暖色系）
        ('food', '食費', '変動費', '#FEE2E2', '食費', 'expense', 210),                    # 明るいレッド（食べ物）
        ('dining', '外食費', '変動費', '#FED7AA', '外食', 'expense', 220),                # 明るいオレンジ（外食）
        ('daily_necessities', '日用品', '変動費', '#D9F99D', '日用品', 'expense', 230),   # ライトグリーン（日用品）
        ('transport', '交通費', '変動費', '#BAE6FD', '交通費', 'expense', 240),           # ライトブルー（移動）
        ('travel', '旅費交通費', '変動費', '#A5F3FC', '旅費', 'expense', 250),            # アクアブルー（旅行）
        ('medical', '医療費', '変動費', '#FBCFE8', '医療', 'expense', 260),               # ライトピンク（医療）
        ('clothing', '衣服費', '変動費', '#F9A8D4', '衣服', 'expense', 270),              # ピンク（衣類）
        ('beauty', '美容費', '変動費', '#F5D0FE', '美容', 'expense', 280),                # 明るいマゼンタ（美容）
        ('education', '教育費', '変動費', '#BFDBFE', '教育', 'expense', 290),             # ブルー（教育）
        ('entertainment', '娯楽費', '変動費', '#FED7AA', '娯楽', 'expense', 300),         # 明るいオレンジ（楽しみ）
        ('social', '交際費', '変動費', '#FDE68A', '交際費', 'expense', 310),              # 明るいゴールド（社交）

        # 支出項目 - その他
        ('credit_card', 'クレジットカード', '決済', '#D1FAE5', 'カード', 'expense', 410),  # ミントグリーン
        ('cash', '現金', '決済', '#A7F3D0', '現金', 'expense', 420),                       # エメラルド
        ('investment', '投資', '貯蓄・投資', '#BEF264', '投資', 'expense', 510),           # ライムグリーン（成長）
        ('savings', '貯金', '貯蓄・投資', '#A7F3D0', '貯金', 'expense', 520),              # エメラルド（貯蓄）
        ('fees', 'その他の経費', 'その他', '#E2E8F0', 'その他', 'expense', 910),           # ライトグレー
        ('uncategorized', '未分類', 'その他', '#E2E8F0', '未分類', 'expense', 920),        # ライトグレー
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
