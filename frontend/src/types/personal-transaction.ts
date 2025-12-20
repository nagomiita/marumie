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
  created_at: Date;
  updated_at: Date;
  organizationId?: string;
}

export interface PersonalTransactionFilters {
  organizationSlug?: string;
  category?: string;
  type?: PersonalTransactionType;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface PersonalTransactionSummary {
  totalCount: number;
  totalIncome: number;
  totalExpense: number;
  categories: Array<{
    category: string;
    count: number;
    totalAmount: number;
  }>;
}
