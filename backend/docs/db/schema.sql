CREATE TYPE user_role AS ENUM ('admin', 'user');

CREATE TYPE organization_type AS ENUM ('household', 'business', 'nonprofit', 'political_organization', 'other');

CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TYPE category_type AS ENUM ('income', 'expense');


CREATE TABLE public.users (
	auth_id VARCHAR(255) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	role user_role DEFAULT 'user' NOT NULL, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_users PRIMARY KEY (id), 
	CONSTRAINT uq_users_auth_id UNIQUE (auth_id), 
	CONSTRAINT uq_users_email UNIQUE (email)
);

COMMENT ON TABLE public.users IS 'ユーザー';

COMMENT ON COLUMN public.users.auth_id IS '認証ID';

COMMENT ON COLUMN public.users.email IS 'メールアドレス';

COMMENT ON COLUMN public.users.name IS '表示名';

COMMENT ON COLUMN public.users.role IS 'ユーザーロール';


CREATE TABLE public.categories (
	id VARCHAR(100) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	"group" VARCHAR(255) NOT NULL, 
	color VARCHAR(20) NOT NULL, 
	short_label VARCHAR(100) NOT NULL, 
	type category_type NOT NULL, 
	display_order INTEGER NOT NULL, 
	is_active BOOLEAN DEFAULT 'true' NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_categories PRIMARY KEY (id)
);

COMMENT ON TABLE public.categories IS 'カテゴリマスタ';

COMMENT ON COLUMN public.categories.id IS 'カテゴリID（主キー・一意識別子）';

COMMENT ON COLUMN public.categories.name IS 'カテゴリ名';

COMMENT ON COLUMN public.categories."group" IS 'カテゴリグループ（大分類）';

COMMENT ON COLUMN public.categories.color IS '表示色（HEXコード）';

COMMENT ON COLUMN public.categories.short_label IS '短縮ラベル';

COMMENT ON COLUMN public.categories.type IS '種別（収入/支出）';

COMMENT ON COLUMN public.categories.display_order IS '表示順序';

COMMENT ON COLUMN public.categories.is_active IS '有効フラグ';


CREATE TABLE public.organizations (
	name VARCHAR(255) NOT NULL, 
	display_name VARCHAR(255) NOT NULL, 
	description TEXT, 
	type organization_type NOT NULL, 
	slug VARCHAR(255) NOT NULL, 
	user_id VARCHAR(36), 
	settings JSON, 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_organizations PRIMARY KEY (id), 
	CONSTRAINT uq_organizations_slug UNIQUE (slug), 
	CONSTRAINT fk_organizations_user_id_users FOREIGN KEY(user_id) REFERENCES public.users (id) ON DELETE SET NULL
);

CREATE INDEX ix_organizations_user_id_type ON public.organizations (user_id, type);

COMMENT ON TABLE public.organizations IS '組織';

COMMENT ON COLUMN public.organizations.name IS '組織名';

COMMENT ON COLUMN public.organizations.display_name IS '表示名';

COMMENT ON COLUMN public.organizations.description IS '説明';

COMMENT ON COLUMN public.organizations.type IS '組織タイプ';

COMMENT ON COLUMN public.organizations.slug IS 'スラッグ';

COMMENT ON COLUMN public.organizations.user_id IS 'ユーザーID';

COMMENT ON COLUMN public.organizations.settings IS '設定';


CREATE TABLE public.transactions (
	date DATE NOT NULL, 
	category_id VARCHAR(100) NOT NULL, 
	subcategory VARCHAR(255), 
	amount NUMERIC(15, 2) NOT NULL, 
	type transaction_type NOT NULL, 
	payment_method VARCHAR(255) NOT NULL, 
	description TEXT NOT NULL, 
	memo TEXT, 
	hash VARCHAR(255) DEFAULT '' NOT NULL, 
	organization_id VARCHAR(36), 
	id VARCHAR(36) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_transactions PRIMARY KEY (id), 
	CONSTRAINT fk_transactions_category_id_categories FOREIGN KEY(category_id) REFERENCES public.categories (id) ON DELETE SET NULL, 
	CONSTRAINT fk_transactions_organization_id_organizations FOREIGN KEY(organization_id) REFERENCES public.organizations (id) ON DELETE CASCADE
);

CREATE INDEX ix_transactions_org_date ON public.transactions (organization_id, date DESC);

CREATE INDEX ix_transactions_category_type ON public.transactions (category_id, type);

COMMENT ON TABLE public.transactions IS '取引';

COMMENT ON COLUMN public.transactions.date IS '取引日';

COMMENT ON COLUMN public.transactions.category_id IS 'カテゴリID';

COMMENT ON COLUMN public.transactions.subcategory IS 'サブカテゴリ';

COMMENT ON COLUMN public.transactions.amount IS '金額';

COMMENT ON COLUMN public.transactions.type IS '取引種別';

COMMENT ON COLUMN public.transactions.payment_method IS '支払い方法';

COMMENT ON COLUMN public.transactions.description IS '説明';

COMMENT ON COLUMN public.transactions.memo IS 'メモ';

COMMENT ON COLUMN public.transactions.hash IS 'ハッシュ値';

COMMENT ON COLUMN public.transactions.organization_id IS '組織ID';
