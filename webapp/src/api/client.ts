export interface OrganizationRead {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
  slug: string;
  type: string;
  user_id?: string | null;
  settings?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PoliticalOrganizationRead {
  id: number;
  display_name: string;
  description?: string | null;
  slug: string;
  org_name?: string | null;
  created_at: string;
  updated_at: string;
}

export type TransactionType =
  | "income"
  | "expense"
  | "non_cash_journal"
  | "offset_income"
  | "offset_expense";

export interface TransactionRead {
  id: number;
  political_organization_id: number;
  transaction_no: string;
  transaction_date: string;
  financial_year: number;
  transaction_type: TransactionType;
  debit_account: string;
  debit_sub_account?: string | null;
  debit_department?: string | null;
  debit_partner?: string | null;
  debit_tax_category?: string | null;
  debit_amount: string;
  credit_account: string;
  credit_sub_account?: string | null;
  credit_department?: string | null;
  credit_partner?: string | null;
  credit_tax_category?: string | null;
  credit_amount: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  memo?: string | null;
  friendly_category?: string | null;
  category_key: string;
  label: string;
  hash: string;
}

export interface BalanceSnapshotRead {
  id: number;
  political_organization_id: number;
  snapshot_date: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const apiClient = {
  listPoliticalOrganizations: () =>
    fetchJson<PoliticalOrganizationRead[]>("/political-organizations"),
  listTransactions: (
    slug: string,
    params?: { financial_year?: number; month?: number; limit?: number },
  ) => {
    const search = new URLSearchParams();
    if (params?.financial_year) search.set("financial_year", `${params.financial_year}`);
    if (params?.month) search.set("month", `${params.month}`);
    search.set("limit", `${params?.limit ?? 500}`);
    const query = search.toString();
    return fetchJson<TransactionRead[]>(
      `/political-organizations/${slug}/transactions${query ? `?${query}` : ""}`,
    );
  },
  listBalanceSnapshots: (slug: string) =>
    fetchJson<BalanceSnapshotRead[]>(`/political-organizations/${slug}/balance-snapshots`),
};
