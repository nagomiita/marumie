// 個人家計簿用のTransaction型

export type PersonalTransactionType = "income" | "expense";

export interface PersonalTransaction {
  id: string;
  date: Date;
  category: string;
  subcategory?: string;
  amount: number;
  type: PersonalTransactionType;
  payment_method: string;
  description: string;
  memo?: string;
  hash: string;
  created_at: Date;
  updated_at: Date;
}

// CSV形式の型定義（日本語ラベル）
export interface PersonalTransactionCsvRow {
  日付: string;
  カテゴリ: string;
  サブカテゴリ?: string;
  金額: string;
  収支区分: "収入" | "支出"; // CSV では日本語
  支払方法: string;
  摘要: string;
  メモ?: string;
}

// 日本語ラベルとEnum値のマッピング
export const TransactionTypeMapping: Record<"収入" | "支出", PersonalTransactionType> = {
  "収入": "income",
  "支出": "expense"
} as const;

// プレビュー用の型
export interface PersonalTransactionPreview {
  id: string;
  date: string;
  category: string;
  subcategory?: string;
  amount: number;
  type: PersonalTransactionType;
  paymentMethod: string;
  description: string;
  memo?: string;
  status: "insert" | "update" | "duplicate" | "error";
  errors?: string[];
}

// アップロード用の型
export interface PersonalTransactionUpload {
  date: Date;
  category: string;
  subcategory?: string;
  amount: number;
  type: PersonalTransactionType;
  paymentMethod: string;
  description: string;
  memo?: string;
}