# Marumie FastAPI Backend (WIP)

このディレクトリは Next.js から FastAPI/SQLAlchemy への移行を進めるための新バックエンド雛形です。現行アプリの機能を段階的に移植します。

## セットアップ

1. Python 3.11 以降を用意してください。
2. 仮想環境を作成・有効化します。
3. 依存関係をインストールします。

```bash
pip install -e .[dev]
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
│   ├── models/       # SQLAlchemy モデル (準備中)
│   └── main.py       # エントリポイント
├── README.md
└── pyproject.toml
```

## 進捗メモ
- FastAPI アプリのひな形と設定ロード、DB セッション生成を追加しました。
- API として `/health` を公開しています。
- SQLAlchemy モデル定義と既存 Prisma スキーマの移植は今後のステップです。

## 今後のタスク
- Prisma スキーマを SQLAlchemy モデルへ変換し、Alembic のマイグレーションを追加
- OpenAPI を基に Orval でクライアント生成するパイプラインを整備
- 既存 Next.js API のロジックを FastAPI エンドポイントとして移植
