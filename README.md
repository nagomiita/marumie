# みらいまる見え家計簿

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

## プロジェクト構成

このプロジェクトは以下のディレクトリ構成で構築されています：

### ディレクトリ構造

```
marumie/
├── webapp/           # フロントエンド（Vite + React）
│   ├── src/
│   │   ├── api/      # FastAPI 用のクライアント
│   │   ├── components/ # UI コンポーネント
│   │   ├── pages/    # 画面コンポーネント
│   │   └── styles/   # グローバルスタイル
│   ├── tests/        # テストファイル
│   └── package.json
├── admin/            # 管理画面
│   ├── src/
│   │   ├── app/      # Next.js App Router
│   │   ├── client/   # クライアントサイドコンポーネント
│   │   ├── server/   # サーバーサイドロジック
│   │   ├── types/    # 型定義
│   │   └── middleware.ts
│   ├── tests/        # テストファイル
│   └── package.json
├── shared/           # 共通モデル・型定義・ユーティリティ
│   ├── models/       # 共通データモデル
│   └── utils/        # 共通ユーティリティ関数
├── data/             # サンプルデータ
│   ├── sampledata.csv
│   └── test_current_liabilities.csv
├── supabase/         # Supabaseローカル開発環境設定
│   ├── config.toml
│   └── templates/
├── prisma/           # データベーススキーマ・マイグレーション
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.cjs
├── logs/             # ログファイル
└── docs/             # 設計ドキュメント（その時点での設計メモなので必ずしも正確ではないです）
    └── images/       # ドキュメント用画像
```

### 各ディレクトリの役割

- **webapp/**: 一般ユーザー向けのフロントエンドアプリケーション（家計簿データの可視化）
- **admin/**: 管理者向けの管理画面（データ登録・管理機能）
- **shared/**: webapp と admin で共通して使用するモデル、型定義、ユーティリティ関数
- **data/**: サンプルデータファイル
- **supabase/**: Supabase ローカル開発環境の設定ファイルとテンプレート
- **prisma/**: データベーススキーマ定義、マイグレーションファイル、シードデータ
- **logs/**: ログファイルやデバッグ用データ
- **docs/**: プロジェクトの設計ドキュメント

## 技術スタック

- **Frontend**: Vite, React 19, TypeScript
- **Backend**: Prisma ORM, Supabase（FastAPI + SQLAlchemy への移行を開始）
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts, ApexCharts, Nivo
- **Database**: PostgreSQL (via Supabase)
- **Development**: pnpm, Biome
- **Testing**: Jest

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

このコマンドで依存関係のインストール、データベースのリセット・マイグレーション・シードデータの投入を一括実行します。

2. **開発サーバーの起動**

```bash
pnpm run dev  # Webapp + 管理画面を同時起動（Supabase自動起動）
```

### よく使うコマンド

#### 開発関連

```bash
pnpm run dev           # Webapp + 管理画面を同時起動（推奨）
pnpm run dev:webapp    # Webappのみ起動
pnpm run dev:admin     # 管理画面のみ起動
```

#### データベース管理

```bash
# データを最初からやり直したい場合
pnpm run db:reset      # データベース完全リセット（データ削除 + マイグレーション + シード）

# 個別実行
pnpm run db:migrate    # マイグレーション実行（スキーマ変更の適用）
pnpm run db:seed       # シードデータ投入（サンプルデータの挿入）
pnpm run db:studio     # Prisma Studio起動（データベースGUI）

# マイグレーション作成（開発者向け）
pnpm run db:migrate:create "migration_name"  # 新しいマイグレーションファイルを作成
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

### FastAPI backend (WIP)

- ディレクトリ: `backend/`
- 起動方法: `cd backend && uvicorn app.main:get_app --reload --factory`
- 設定: `backend/.env.example` を `.env` にコピーして `DATABASE_URL` などを指定
- Prisma スキーマを移植した SQLAlchemy モデルと Alembic の初期マイグレーションを含みます。スキーマを適用するには `cd backend && alembic upgrade head` を実行してください。
- API 進捗: `/health` に加え、組織一覧 `/organizations`、政治団体のトランザクション・残高スナップショット `/political-organizations/{slug}/transactions` `/political-organizations/{slug}/balance-snapshots`、個人向け取引 `/personal-transactions` を SQLAlchemy ベースで参照できます。

## データベースのマイグレーション

### 本番環境・開発環境

- Vercel で行われる webapp の build 過程で自動的にマイグレーションが実行されます

### ローカル開発環境

- 以下のコマンドでマイグレーションを実行してください：

```bash
pnpm run db:migrate
```

### ブラウザからの確認方法

- **メインアプリ**: [https://marumie-kakeibo-hrn0327.netlify.app/o/team-mirai](https://marumie-kakeibo-hrn0327.netlify.app/o/team-mirai)
- **管理画面**: [https://marumie-kakeibo-hrn0327-admin.netlify.app/users](https://marumie-kakeibo-hrn0327-admin.netlify.app/users)
- **Supabase Studio**: [https://supabase.com/dashboard/org/wxvunoocumzfosnxunct](https://supabase.com/dashboard/org/wxvunoocumzfosnxunct)

- **メインアプリ**: [http://localhost:3000](http://localhost:3000)
- **管理画面**: [http://localhost:3001](http://localhost:3001)
- **Supabase Studio**: [http://127.0.0.1:54323](http://127.0.0.1:54323)

### モックデータの使用

`webapp/.env.local` に以下を追加してモックデータを有効化：

```
USE_MOCK_DATA=true
```

設定後、トランザクションページのバックエンドがモックデータを返すようになります。

## サンプルデータ (まる見え家計簿用 CSV データの作成方法)

### 銀行・クレジットカード明細 CSV の変換

各金融機関から取得した CSV を「まる見え家計簿」で利用可能な統一フォーマットに変換できます。

#### ディレクトリ構成

```
data/
├── config.json          # 変換設定ファイル
├── convert_csv.sh       # 変換スクリプト
├── input/              # 変換元CSVファイルの配置先
│   ├── 2025/           # 年ごとにディレクトリを作成
│   │   ├── 01/         # 月ごとにディレクトリを作成
│   │   ├── 02/
│   │   └── ...
│   └── ...
└── output/             # 変換後CSVファイルの出力先
    ├── 2025/
    │   ├── 01/
    │   ├── 02/
    │   └── ...
    └── ...
```

#### 使い方

1. **入力ファイルの配置**

   `data/input/` 以下に年・月のディレクトリ（`YYYY/MM`形式）を作成し、各金融機関から取得した CSV ファイルを配置します。

   ```bash
   mkdir -p data/input/2025/01
   # CSVファイルをdata/input/2025/01/にコピー
   ```

   > `data/input/` 直下にCSVを置いただけでも、ファイル内の日付から自動で対象年月を推測し、`YYYY/MM` フォルダへ仕分けしてから変換します。従来の `YYYY-MM` 形式ディレクトリが残っている場合も、実行時に自動で `YYYY/MM` 構造へ整形されます。

2. **設定ファイルの編集（必要に応じて）**

   `data/config.json` で以下を設定できます：

   - 銀行・カードごとの列マッピング（日付、摘要、金額など）
   - ファイル名パターン（例: `UFJ_sample_*.csv`）
   - カテゴリ分類ルール（キーワードによる自動分類）

3. **変換スクリプトの実行**

   ```bash
   cd data
   bash convert_csv.sh       # シェルから実行
   # または Python スクリプトを直接実行
   python3 convert_csv.py
   ```

   変換された CSV ファイルは `data/output/YYYY/MM/unified_YYYY-MM.csv` に出力されます。

4. **変換結果のアップロード**

   管理画面（ http://localhost:3001 ）の「CSV アップロード」機能から、`data/output/` 内の統一 CSV ファイルをアップロードします。

#### サポートされている形式

現在、以下の金融機関に対応しています：

- UFJ 銀行（`UFJ_sample_*.csv`）

新しい金融機関を追加する場合は、`data/config.json` の `banks` セクションに設定を追加してください。

## ライセンス

このプロジェクトは [GNU Affero General Public License v3.0](LICENSE) の下でライセンスされています。

### コントリビューション

このプロジェクトへのコントリビューションを行う場合は、[コントリビューターライセンス契約(CLA)](CLA.md) への同意が必要です。

## ライセンス表示

このソフトウェアを使用する場合は、適切なライセンス表示を行ってください。詳細は [LICENSE](LICENSE) ファイルをご確認ください。
