export interface CategoryMapping {
  key: string;
  category: string;
  subcategory?: string;
  color: string;
  shortLabel: string;
  type: "income" | "expense";
}

/**
 * アカウント名から表示用カテゴリへのマッピング辞書
 */
export const PL_CATEGORIES: Record<string, CategoryMapping> = {
  // 収入項目
  "給与収入": {
    key: "salary",
    category: "収入",
    subcategory: "給与",
    color: "#059669",
    shortLabel: "給与",
    type: "income"
  },
  "賞与": {
    key: "bonus",
    category: "収入",
    subcategory: "賞与",
    color: "#0891B2",
    shortLabel: "賞与",
    type: "income"
  },
  "副業収入": {
    key: "side-income",
    category: "収入",
    subcategory: "副業",
    color: "#EA580C",
    shortLabel: "副業",
    type: "income"
  },
  "投資収益": {
    key: "investment-income",
    category: "収入",
    subcategory: "投資収益",
    color: "#DC2626",
    shortLabel: "投資収益",
    type: "income"
  },
  "臨時収入": {
    key: "extra-income",
    category: "収入",
    subcategory: "臨時収入",
    color: "#65A30D",
    shortLabel: "臨時収入",
    type: "income"
  },
  "雑収入": {
    key: "misc-income",
    category: "収入",
    subcategory: "その他",
    color: "#D97706",
    shortLabel: "その他収入",
    type: "income"
  },
  "その他の収入": {
    key: "other-income",
    category: "収入",
    subcategory: "その他",
    color: "#6B7280",
    shortLabel: "その他",
    type: "income"
  },

  // 支出項目 - 固定費
  "家賃": {
    key: "rent",
    category: "固定費",
    subcategory: "住居費",
    color: "#0369A1",
    shortLabel: "家賃",
    type: "expense"
  },
  "住宅ローン": {
    key: "mortgage",
    category: "固定費",
    subcategory: "住居費",
    color: "#1E40AF",
    shortLabel: "住宅ローン",
    type: "expense"
  },
  "水道光熱費": {
    key: "utilities",
    category: "固定費",
    subcategory: "光熱費",
    color: "#126C81",
    shortLabel: "光熱費",
    type: "expense"
  },
  "通信費": {
    key: "communication",
    category: "固定費",
    subcategory: "通信費",
    color: "#6D28D9",
    shortLabel: "通信費",
    type: "expense"
  },
  "保険料": {
    key: "insurance",
    category: "固定費",
    subcategory: "保険",
    color: "#047857",
    shortLabel: "保険",
    type: "expense"
  },
  "サブスクリプション": {
    key: "subscription",
    category: "固定費",
    subcategory: "サブスク",
    color: "#7C3AED",
    shortLabel: "サブスク",
    type: "expense"
  },

  // 支出項目 - 変動費
  "食費": {
    key: "food",
    category: "変動費",
    subcategory: "食費",
    color: "#DC2626",
    shortLabel: "食費",
    type: "expense"
  },
  "外食費": {
    key: "dining",
    category: "変動費",
    subcategory: "外食",
    color: "#EA580C",
    shortLabel: "外食",
    type: "expense"
  },
  "日用品": {
    key: "daily-necessities",
    category: "変動費",
    subcategory: "日用品",
    color: "#4D7C0F",
    shortLabel: "日用品",
    type: "expense"
  },
  "交通費": {
    key: "transportation",
    category: "変動費",
    subcategory: "交通費",
    color: "#0891B2",
    shortLabel: "交通費",
    type: "expense"
  },
  "旅費交通費": {
    key: "travel",
    category: "変動費",
    subcategory: "旅行・交通",
    color: "#0E7490",
    shortLabel: "旅費",
    type: "expense"
  },
  "医療費": {
    key: "medical",
    category: "変動費",
    subcategory: "医療・健康",
    color: "#BE185D",
    shortLabel: "医療",
    type: "expense"
  },
  "衣服費": {
    key: "clothing",
    category: "変動費",
    subcategory: "衣服・美容",
    color: "#DB2777",
    shortLabel: "衣服",
    type: "expense"
  },
  "美容費": {
    key: "beauty",
    category: "変動費",
    subcategory: "美容",
    color: "#EC4899",
    shortLabel: "美容",
    type: "expense"
  },
  "教育費": {
    key: "education",
    category: "変動費",
    subcategory: "教育",
    color: "#3856B1",
    shortLabel: "教育",
    type: "expense"
  },
  "娯楽費": {
    key: "entertainment",
    category: "変動費",
    subcategory: "娯楽",
    color: "#C2410C",
    shortLabel: "娯楽",
    type: "expense"
  },
  "交際費": {
    key: "social",
    category: "変動費",
    subcategory: "交際費",
    color: "#A16207",
    shortLabel: "交際費",
    type: "expense"
  },

  // 支出項目 - その他
  "クレジットカード": {
    key: "credit-card",
    category: "決済",
    subcategory: "クレジットカード",
    color: "#059669",
    shortLabel: "カード",
    type: "expense"
  },
  "現金": {
    key: "cash",
    category: "決済",
    subcategory: "現金",
    color: "#0D9488",
    shortLabel: "現金",
    type: "expense"
  },
  "貯金": {
    key: "savings",
    category: "貯蓄・投資",
    subcategory: "貯金",
    color: "#65A30D",
    shortLabel: "貯金",
    type: "expense"
  },
  "投資": {
    key: "investment",
    category: "貯蓄・投資",
    subcategory: "投資",
    color: "#65A30D",
    shortLabel: "投資",
    type: "expense"
  },
  "その他の経費": {
    key: "other-expenses",
    category: "その他",
    subcategory: "その他",
    color: "#334155",
    shortLabel: "その他",
    type: "expense"
  }
};

/**
 * 貸借対照表科目のカテゴリ分類
 */
export const BS_CATEGORIES: Record<string, { type: "asset" | "liability" | "net_asset" }> = {
  "普通預金": {
    type: "asset"
  },
  "未払金/未払費用": {
    type: "liability"
  },
};

/**
 * 現金類の科目
 */
export const CASH_ACCOUNTS = new Set(["普通預金"]);
