import { parse } from "csv-parse/sync";
import type {
  PersonalTransactionCsvRow,
  PersonalTransactionType,
  TransactionTypeMapping,
} from "@/shared/models/personal-transaction";

export interface PersonalCsvData {
  date: Date;
  category: string;
  subcategory?: string;
  amount: number;
  type: PersonalTransactionType;
  paymentMethod: string;
  description: string;
  memo?: string;
}

export class PersonalCsvLoader {
  private readonly expectedHeaders = [
    "日付",
    "カテゴリ",
    "サブカテゴリ",
    "金額",
    "収支区分",
    "支払方法",
    "摘要",
    "メモ",
  ];

  load(csvContent: string): PersonalCsvData[] {
    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      }) as PersonalTransactionCsvRow[];

      // ヘッダーの検証
      if (records.length === 0) {
        throw new Error("CSVファイルが空です");
      }

      // 最初のレコードでヘッダーの確認
      const firstRecord = records[0];
      const actualHeaders = Object.keys(firstRecord);
      const missingHeaders = this.expectedHeaders.filter(
        (header) => !actualHeaders.includes(header),
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `必要なヘッダーが不足しています: ${missingHeaders.join(", ")}`,
        );
      }

      // データの変換
      return records.map((record, index) => {
        try {
          return this.convertRecord(record, index + 1);
        } catch (error) {
          throw new Error(
            `行 ${index + 2}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`CSV解析エラー: ${String(error)}`);
    }
  }

  private convertRecord(
    record: PersonalTransactionCsvRow,
    lineNumber: number,
  ): PersonalCsvData {
    // 日付の変換
    const date = this.parseDate(record.日付);
    if (!date) {
      throw new Error(`無効な日付: ${record.日付}`);
    }

    // 金額の変換
    const amount = this.parseAmount(record.金額);
    if (amount === null || amount < 0) {
      throw new Error(`無効な金額: ${record.金額}`);
    }

    // 収支区分の変換
    const type = this.parseTransactionType(record.収支区分);
    if (!type) {
      throw new Error(`無効な収支区分: ${record.収支区分}`);
    }

    // 必須フィールドの検証
    if (!record.カテゴリ?.trim()) {
      throw new Error("カテゴリが入力されていません");
    }

    if (!record.支払方法?.trim()) {
      throw new Error("支払方法が入力されていません");
    }

    if (!record.摘要?.trim()) {
      throw new Error("摘要が入力されていません");
    }

    return {
      date,
      category: record.カテゴリ.trim(),
      subcategory: record.サブカテゴリ?.trim() || undefined,
      amount,
      type,
      paymentMethod: record.支払方法.trim(),
      description: record.摘要.trim(),
      memo: record.メモ?.trim() || undefined,
    };
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr?.trim()) return null;

    // YYYY/MM/DD, YYYY-MM-DD 形式をサポート
    const cleaned = dateStr.trim();
    const patterns = [
      /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/,
      /^(\d{4})年(\d{1,2})月(\d{1,2})日$/,
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);

        const date = new Date(year, month - 1, day);
        if (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        ) {
          return date;
        }
      }
    }

    return null;
  }

  private parseAmount(amountStr: string): number | null {
    if (!amountStr?.trim()) return null;

    // カンマ、円記号、スペースを削除
    const cleaned = amountStr
      .trim()
      .replace(/[,¥￥\s]/g, "")
      .replace(/^￥/, "");

    const amount = Number(cleaned);
    return isNaN(amount) ? null : Math.abs(amount); // 絶対値を返す
  }

  private parseTransactionType(
    typeStr: string,
  ): PersonalTransactionType | null {
    if (!typeStr?.trim()) return null;

    const cleaned = typeStr.trim() as "収入" | "支出";
    const mapping: Record<"収入" | "支出", PersonalTransactionType> = {
      収入: "income",
      支出: "expense",
    };

    return mapping[cleaned] || null;
  }
}
