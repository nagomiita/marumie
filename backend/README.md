# Marumie FastAPI Backend (WIP)

このディレクトリは Next.js から FastAPI/SQLAlchemy への移行を進めるための新バックエンド雛形です。現行アプリの機能を段階的に移植します。

## セットアップ

1. Python 3.11 以降を用意してください。
2. 仮想環境を作成・有効化します。
3. 依存関係をインストールします。

```bash
uv sync --extra dev
```

4. 開発サーバーを起動します。

```bash
uvicorn app.main:get_app --reload --factory
```

## 環境変数

`backend/.env.example` を `.env` にコピーして編集してください。

- `DATABASE_URL`: PostgreSQL 接続文字列 (例: `postgresql+psycopg://user:pass@localhost:5432/marumie`)
- `APP_ENV`: `development` / `production` を指定します。

## ディレクトリ構成

```
backend/
├── app/
│   ├── api/          # FastAPI ルーター
│   ├── core/         # 設定・依存性
│   ├── models/       # SQLAlchemy モデル/Enum 定義
│   └── main.py       # エントリポイント
├── README.md
├── pyproject.toml
└── alembic/          # Alembic 設定とマイグレーション
```

## 進捗メモ
- FastAPI アプリのひな形と設定ロード、DB セッション生成を追加しました。
- API として `/health` を公開しています。
- Prisma スキーマを SQLAlchemy モデルへ移植し、初期マイグレーションを Alembic に追加しました。
- SQLAlchemy 経由でデータを読むサンプルとして以下の参照 API を追加しました。
  - `/organizations`（任意の `type` / `user_id` でフィルタ可能）
  - `/political-organizations/{slug}` と取引参照 `/political-organizations/{slug}/transactions`
  - 残高スナップショット `/political-organizations/{slug}/balance-snapshots`
  - 個人取引 `/personal-transactions`

## 今後のタスク
- Alembic で本番 DB へ適用するための接続設定を確認・調整
- OpenAPI を基に Orval でクライアント生成するパイプラインを整備
- 既存 Next.js API のロジックを FastAPI エンドポイントとして移植

## マイグレーションの実行

```bash
# 初期化後に最新まで適用
uv run alembic upgrade head

# スキーマ変更時の自動生成例
uv run alembic revision --autogenerate -m "describe change"
```

## データベースのリセットと初期データ投入

### 1. データベースを完全リセット

```bash
# スキーマを完全削除して再作成
uv run python -m scripts.reset_db

# マイグレーションを最新まで適用
uv run alembic upgrade head
```

### 2. シードデータの投入
```bash
# 組織とカテゴリマスタを投入
uv run python -m scripts.seed
```

環境変数でシードデータをカスタマイズできます。`.env`ファイルに以下を追加してください：

```bash
SEED_ORG_NAME=your_org_name
SEED_ORG_DISPLAY_NAME=組織表示名
SEED_ORG_TYPE=household
```

### 3. CSVデータのインポート（オプション）

```bash
uv run python -m scripts.data.merge_config
# フォーマット統合スクリプト
uv run python -m scripts.data.convert_csv
# トランザクションデータをCSVからインポート
uv run python -m scripts.import_csv
```

デフォルトでは `backend/scripts/data/output/unified_all.csv` を読み込みます。

### ワンライナーで全実行

```bash
# リセット → マイグレーション → シード → CSVインポート
uv run python -m scripts.reset_db && \
uv run alembic upgrade head && \
uv run python -m scripts.seed && \
uv run python -m scripts.import_csv
```
