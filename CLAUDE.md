# Claude Code 設定

## 設計作業ルール

設計作業を依頼された場合は、以下のルールに従ってファイルを作成すること：

- ファイル名: `YYYYMMDD_HHMM_{日本語の作業内容}.md`
- 保存場所: `docs/` 以下
- フォーマット: Markdown

例: `docs/20250815_1430_ユーザー認証システム設計.md`

## フロントエンド実装ルール（Vite + React）

- ルーティングは `frontend/src/pages/` に寄せる
- UI コンポーネントは `frontend/src/components/` に分離する
- 共有状態やデータ取得は `frontend/src/contexts/` / `frontend/src/hooks/` に集約する
- クライアント専用ユーティリティは `frontend/src/client/` に置く
- 設定値は `frontend/src/config/` にまとめる
- グローバルスタイルは `frontend/src/styles/` に置く

## バックエンド実装ルール（FastAPI）

- ルーターは `backend/app/api/` に配置する
- SQLAlchemy モデルは `backend/app/models/` に配置する
- Pydantic スキーマは `backend/app/schemas/` に配置する
- 業務ロジックは `backend/app/services/` に集約する
- 設定・依存関係は `backend/app/core/` に置く

# GitHub操作ルール
- ユーザーからPRを出して、と言われたときは、現在の作業のフィーチャーブランチを切りコミットを行ってからPRを出すようにする
- developやmainへの直接pushは禁止です
- Alembicのマイグレーションを含む差分は自動デプロイで環境を壊しうるので、ユーザーに許可を取ってから実行してください
- ロジックにまつわる変更をしたあとのPushの前には、プロジェクトルートで　`npm run typecheck` と `npm run lint` を行ってからPushするようにしてください
- PR作成時は `gh pr create` コマンドに `--base` オプションを付けず、デフォルトのベースブランチを使用してください
