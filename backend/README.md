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
alembic upgrade head

# スキーマ変更時の自動生成例
alembic revision --autogenerate -m "describe change"
```
