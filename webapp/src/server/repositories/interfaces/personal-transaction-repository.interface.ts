import type {
  PersonalTransaction,
  PersonalTransactionFilters,
} from "@/types/personal-transaction";

export interface PersonalTransactionRepository {
  findMany(filters: PersonalTransactionFilters): Promise<PersonalTransaction[]>;

  count(filters: PersonalTransactionFilters): Promise<number>;

  findByOrganizationSlug(
    slug: string,
    filters?: Omit<PersonalTransactionFilters, "organizationSlug">,
  ): Promise<PersonalTransaction[]>;

  getTotalAmountByType(
    organizationSlug: string,
    type: "income" | "expense",
    financialYear?: number,
  ): Promise<number>;

  getMonthlyAggregation(
    organizationSlug: string,
    financialYear: number,
  ): Promise<
    Array<{
      month: number;
      totalIncome: number;
      totalExpense: number;
      netAmount: number;
    }>
  >;

  getCategoryAggregation(
    organizationSlug: string,
    financialYear?: number,
    month?: number,
  ): Promise<
    Array<{
      category: string;
      subcategory?: string;
      type: "income" | "expense";
      totalAmount: number;
      count: number;
    }>
  >;

  getDateRangeForOrganizations(
    slugs: string[],
  ): Promise<{ minDate: Date | null; maxDate: Date | null }>;
}
