from __future__ import annotations

from io import BytesIO

import polars as pl
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Transaction


class CSVUploadService:
    """CSVアップロードに関するビジネスロジックを提供するサービスクラス"""

    @staticmethod
    def process_csv_dataframe(
        df: pl.DataFrame,
        organization_id: str,
    ) -> list[Transaction]:
        """CSVデータフレームをトランザクションオブジェクトのリストに変換

        Args:
            df: polarsのDataFrame（CSVから読み込み済み）
            organization_id: 組織ID

        Returns:
            トランザクションオブジェクトのリスト

        Raises:
            HTTPException: データ変換エラー
        """
        if df.is_empty():
            raise HTTPException(status_code=400, detail="CSVファイルが空です")

        # 日本語ヘッダーから英語カラム名へのマッピング
        column_mapping = {
            "日付": "date",
            "カテゴリ": "category",
            "サブカテゴリ": "subcategory",
            "金額": "amount",
            "収支区分": "type",
            "支払方法": "payment_method",
            "摘要": "description",
            "メモ": "memo",
        }

        # カラム名を変換
        df = df.rename(
            {old: new for old, new in column_mapping.items() if old in df.columns}
        )

        # 収支区分の日本語から英語へのマッピング
        type_mapping = {
            "支出": "expense",
            "収入": "income",
            "振替": "transfer",
        }

        # typeカラムが存在する場合、日本語を英語に変換
        if "type" in df.columns:
            df = df.with_columns(
                pl.col("type").map_elements(
                    lambda x: type_mapping.get(x, x) if x is not None else x,
                    return_dtype=pl.String,
                )
            )

        # 日付カラムの処理
        if "date" in df.columns:
            # 複数の日付フォーマットに対応してパース
            try:
                df = df.with_columns(
                    pl.col("date")
                    .str.to_date(format="%Y-%m-%d", strict=False)
                    .fill_null(
                        pl.col("date").str.to_date(format="%Y/%m/%d", strict=False)
                    )
                    .alias("date")
                )
            except Exception:
                pass

            # 日付変換に失敗した行をチェック
            null_dates = df.filter(pl.col("date").is_null())
            if null_dates.height > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"行 {', '.join(str(i + 2) for i in range(null_dates.height))}: 日付フォーマットが不正です",
                )

        # 金額カラムの処理
        if "amount" in df.columns:
            # 文字列を数値に変換
            df = df.with_columns(
                pl.col("amount").cast(pl.Float64, strict=False).alias("amount")
            )

            null_amounts = df.filter(pl.col("amount").is_null())
            if null_amounts.height > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"行 {', '.join(str(i + 2) for i in range(null_amounts.height))}: 金額が不正です",
                )

        # Transactionには必須フィールドのデフォルト値を設定
        if "payment_method" not in df.columns:
            df = df.with_columns(pl.lit("現金").alias("payment_method"))
        if "description" not in df.columns:
            df = df.with_columns(pl.lit("").alias("description"))

        # 必須フィールドのバリデーション
        if "date" not in df.columns or "amount" not in df.columns:
            raise HTTPException(
                status_code=400,
                detail="必須フィールド（date、amount）がありません",
            )

        # organization_idを追加
        df = df.with_columns(pl.lit(organization_id).alias("organization_id"))

        # トランザクションオブジェクトを作成（polarsは行単位のイテレーションより辞書変換が効率的）
        transactions = []
        for row_dict in df.to_dicts():
            try:
                transactions.append(Transaction(**row_dict))
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"データ変換エラー - {str(e)}",
                )

        return transactions

    @classmethod
    async def upload_transactions_csv(
        cls,
        session: AsyncSession,
        organization_id: str,
        file: UploadFile,
    ) -> dict:
        """CSVファイルをアップロードしてトランザクションを一括作成

        Args:
            session: データベースセッション
            organization_id: 組織ID
            file: アップロードされたCSVファイル

        Returns:
            インポート結果の辞書

        Raises:
            HTTPException: ファイル形式エラー、データエラー等
        """
        if not file.filename or not file.filename.endswith(".csv"):
            raise HTTPException(
                status_code=400, detail="CSVファイルのみアップロード可能です"
            )

        try:
            # CSVファイルを読み込み
            content = await file.read()

            # polarsでCSVを読み込み（高速）
            df = pl.read_csv(
                BytesIO(content), encoding="utf-8", infer_schema_length=1000
            )

            # 共通のCSV処理ロジックを使用
            transactions = cls.process_csv_dataframe(df, organization_id)

            # データベースに一括挿入
            session.add_all(transactions)
            await session.commit()

            return {
                "success": True,
                "message": f"{len(transactions)}件のトランザクションをインポートしました",
                "count": len(transactions),
            }

        except HTTPException:
            raise
        except Exception as e:
            await session.rollback()
            raise HTTPException(
                status_code=500, detail=f"CSVアップロードエラー: {str(e)}"
            )

    @classmethod
    async def import_csv_from_path(
        cls,
        session: AsyncSession,
        organization_id: str,
        csv_path: str,
    ) -> dict:
        """ファイルパスからCSVをインポート（スクリプト用）

        Args:
            session: データベースセッション
            organization_id: 組織ID
            csv_path: CSVファイルのパス

        Returns:
            インポート結果の辞書

        Raises:
            HTTPException: ファイル形式エラー、データエラー等
        """
        try:
            # polarsでCSVを直接読み込み（BOM対応）
            df = pl.read_csv(csv_path, encoding="utf-8-sig", infer_schema_length=1000)

            # 共通のCSV処理ロジックを使用
            transactions = cls.process_csv_dataframe(df, organization_id)

            # データベースに一括挿入
            session.add_all(transactions)
            await session.commit()

            return {
                "success": True,
                "message": f"{len(transactions)}件のトランザクションをインポートしました",
                "count": len(transactions),
            }

        except HTTPException:
            raise
        except Exception as e:
            await session.rollback()
            raise HTTPException(
                status_code=500, detail=f"CSVインポートエラー: {str(e)}"
            )
