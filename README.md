# みらいまる見え家計簿

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

## プロジェクト構成

このプロジェクトは以下のディレクトリ構成で構築されています：

### ディレクトリ構造

```
marumie/
├── frontend/           # フロントエンド（Vite + React）
│   ├── src/            # UI・ルーティング・APIクライアント
│   ├── tests/          # フロントエンドのテスト
│   └── package.json
├── backend/            # FastAPI + SQLAlchemy バックエンド
│   ├── app/            # API・モデル・設定
│   ├── alembic/        # DBマイグレーション
│   └── scripts/        # データ準備・インポート
├── supabase/           # Supabaseローカル開発環境設定
├── docs/               # 設計ドキュメント
└── package.json        # ワークスペーススクリプト
```

### 各ディレクトリの役割

- **frontend/**: 一般ユーザー向けのフロントエンドアプリケーション（家計簿データの可視化）
- **backend/**: FastAPI/SQLAlchemy による API とデータ処理
- **supabase/**: Supabase ローカル開発環境の設定ファイルとテンプレート
- **docs/**: プロジェクトの設計ドキュメント

## 技術スタック

- **Frontend**: Vite, React 19, TypeScript
- **Backend**: FastAPI, SQLAlchemy, Alembic
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts, ApexCharts, Nivo
- **Database**: PostgreSQL (via Supabase)
- **Development**: pnpm, uv, Biome
- **Testing**: Vitest

## 画面イメージ

![アプリケーションのスクリーンショット](docs/images/screenshot.png)

※ 表示されている値は実際の値ではありません。

## ローカル開発手順

このプロジェクトは Supabase ローカル開発環境を使用してローカル開発を行います。

### 開発環境セットアップ

1. **初回セットアップ（推奨）**

```bash
pnpm run dev:setup
```

このコマンドで依存関係のインストール、バックエンド依存関係の同期、Supabase 起動、マイグレーション適用を一括実行します。

2. **開発サーバーの起動**

```bash
pnpm run dev  # frontend + backend を同時起動（Supabase自動起動）
```

### よく使うコマンド

#### 開発関連

```bash
pnpm run dev           # frontend + backend を同時起動（推奨）
pnpm run dev:frontend  # frontendのみ起動
pnpm run dev:backend   # backendのみ起動
```

#### データベース管理

```bash
# データを最初からやり直したい場合
pnpm run db:reset      # DBリセット + マイグレーション + シード

# 個別実行
pnpm run db:migrate    # Alembicマイグレーション実行
pnpm run db:seed       # シードデータ投入

# マイグレーション作成（開発者向け）
pnpm run db:migrate:create "migration_name"
```

#### コード品質チェック

```bash
pnpm run lint          # 全体のLint実行
pnpm run format        # コードフォーマット実行
pnpm run typecheck     # 型チェック実行
pnpm run test          # テスト実行
```

#### Supabase 管理

```bash
pnpm run supabase:start   # Supabaseローカル環境起動
pnpm run supabase:stop    # Supabaseローカル環境停止
pnpm run supabase:status  # Supabase状態確認
```

#### ユーティリティ

```bash
pnpm run clean         # 全てのnode_modulesとSupabaseを停止
pnpm run fresh         # クリーンインストール + セットアップ
```

### FastAPI backend

- ディレクトリ: `backend/`
- 起動方法: `pnpm run dev:backend`（または `cd backend && uv run uvicorn app.main:get_app --reload --factory`）
- 設定: `backend/.env.example` を `.env` にコピーして `DATABASE_URL` などを指定
- マイグレーション適用: `pnpm run db:migrate`
- API: `/health`、`/organizations`、`/political-organizations/{slug}/transactions`、`/political-organizations/{slug}/balance-snapshots`、`/personal-transactions`

## データベースのマイグレーション

### ローカル開発環境

- 以下のコマンドでマイグレーションを実行してください：

```bash
pnpm run db:migrate
```

### ブラウザからの確認方法

- **フロントエンド**: [http://localhost:5173](http://localhost:5173)
- **バックエンド**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Supabase Studio**: [http://127.0.0.1:54323](http://127.0.0.1:54323)

## サンプルデータ (まる見え家計簿用 CSV データの作成方法)

### 銀行・クレジットカード明細 CSV の変換

各金融機関から取得した CSV を「まる見え家計簿」で利用可能な統一フォーマットに変換できます。

#### ディレクトリ構成

```
backend/scripts/data/
├── config.json          # 変換設定ファイル
├── config.public.json   # 共有可能な設定
├── config.private.json  # 秘匿設定
├── input/               # 変換元CSVファイルの配置先
│   ├── 2025/            # 年ごとにディレクトリを作成
│   │   ├── 01/          # 月ごとにディレクトリを作成
│   │   ├── 02/
│   │   └── ...
│   └── ...
└── output/              # 変換後CSVファイルの出力先
    ├── 2025/
    │   ├── 01/
    │   ├── 02/
    │   └── ...
    └── ...
```

#### 使い方

1. **入力ファイルの配置**

   `backend/scripts/data/input/` 以下に年・月のディレクトリ（`YYYY/MM`形式）を作成し、各金融機関から取得した CSV ファイルを配置します。

   ```bash
   mkdir -p backend/scripts/data/input/2025/01
   # CSVファイルを backend/scripts/data/input/2025/01/ にコピー
   ```

   > `backend/scripts/data/input/` 直下にCSVを置いただけでも、ファイル内の日付から自動で対象年月を推測し、`YYYY/MM` フォルダへ仕分けしてから変換します。従来の `YYYY-MM` 形式ディレクトリが残っている場合も、実行時に自動で `YYYY/MM` 構造へ整形されます。

2. **設定ファイルの編集（必要に応じて）**

   `backend/scripts/data/config.json` で以下を設定できます：

   - 銀行・カードごとの列マッピング（日付、摘要、金額など）
   - ファイル名パターン（例: `UFJ_sample_*.csv`）
   - カテゴリ分類ルール（キーワードによる自動分類）

3. **変換スクリプトの実行**

   ```bash
   cd backend
   uv run python -m scripts.data.convert_csv
   ```

   変換された CSV ファイルは `backend/scripts/data/output/YYYY/MM/unified_YYYY-MM.csv` に出力されます。

4. **変換結果のアップロード**

   バックエンドのインポートスクリプトで `backend/scripts/data/output/` 内の統一 CSV ファイルを取り込みます。

#### サポートされている形式

現在、以下の金融機関に対応しています：

- UFJ 銀行（`UFJ_sample_*.csv`）

新しい金融機関を追加する場合は、`backend/scripts/data/config.json` の `banks` セクションに設定を追加してください。

## ライセンス

このプロジェクトは [GNU Affero General Public License v3.0](LICENSE) の下でライセンスされています。

### コントリビューション

このプロジェクトへのコントリビューションを行う場合は、[コントリビューターライセンス契約(CLA)](CLA.md) への同意が必要です。

## ライセンス表示

このソフトウェアを使用する場合は、適切なライセンス表示を行ってください。詳細は [LICENSE](LICENSE) ファイルをご確認ください。
