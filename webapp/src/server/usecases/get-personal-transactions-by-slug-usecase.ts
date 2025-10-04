import type { Organization } from "../repositories/interfaces/organization-repository.interface";
import type { PersonalTransactionFilters } from "@/types/personal-transaction";
import type {
  DisplayTransaction,
  DisplayTransactionType,
} from "@/types/display-transaction";
import type { OrganizationRepository } from "../repositories/interfaces/organization-repository.interface";
import type { PersonalTransactionRepository } from "../repositories/interfaces/personal-transaction-repository.interface";
import { convertPersonalToDisplayTransactions } from "../utils/personal-transaction-converter";

export interface GetPersonalTransactionsBySlugParams {
  slugs: string[];
  page?: number;
  perPage?: number;
  transactionType?: DisplayTransactionType;
  dateFrom?: Date;
  dateTo?: Date;
  financialYear: number;
  sortBy?: "date" | "amount";
  order?: "asc" | "desc";
  categories?: string[];
}

export interface GetPersonalTransactionsBySlugResult {
  transactions: DisplayTransaction[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  organizations: Organization[];
  lastUpdatedAt: string | null;
}

export class GetPersonalTransactionsBySlugUsecase {
  constructor(
    private personalTransactionRepository: PersonalTransactionRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    params: GetPersonalTransactionsBySlugParams,
  ): Promise<GetPersonalTransactionsBySlugResult> {
    try {
      const organizations = await Promise.all(
        params.slugs.map((slug) =>
          this.organizationRepository.findBySlug(slug),
        ),
      );

      const validOrganizations = organizations.filter(
        (org): org is Organization => org !== null,
      );

      if (validOrganizations.length === 0) {
        throw new Error(
          `Organizations not found for slugs: ${params.slugs.join(", ")}`,
        );
      }

      const page = params.page || 1;
      const perPage = params.perPage || 20;
      const offset = (page - 1) * perPage;

      // 年度範囲を設定
      const startDate = new Date(params.financialYear, 3, 1); // 4月1日
      const endDate = new Date(params.financialYear + 1, 2, 31); // 翌年3月31日

      const filters: PersonalTransactionFilters = {
        dateFrom: params.dateFrom || startDate,
        dateTo: params.dateTo || endDate,
        category: params.categories?.[0], // 複数カテゴリ未対応
        type: this.mapDisplayTypeToPersonalType(params.transactionType),
        limit: perPage,
        offset,
      };

      // 各組織のデータを取得
      const allTransactions = [];
      for (const org of validOrganizations) {
        const transactions =
          await this.personalTransactionRepository.findByOrganizationSlug(
            org.slug,
            filters,
          );
        allTransactions.push(...transactions);
      }

      // ソート
      allTransactions.sort((a, b) => {
        const sortField = params.sortBy || "date";
        const order = params.order || "desc";

        let comparison = 0;
        if (sortField === "date") {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === "amount") {
          comparison = a.amount - b.amount;
        }

        return order === "asc" ? comparison : -comparison;
      });

      // ページネーション
      const total = allTransactions.length;
      const paginatedTransactions = allTransactions.slice(
        offset,
        offset + perPage,
      );

      // 最終更新日時を取得
      const lastUpdatedAt =
        allTransactions.length > 0
          ? Math.max(
              ...allTransactions.map((t) => new Date(t.updated_at).getTime()),
            )
          : null;

      return {
        transactions: convertPersonalToDisplayTransactions(
          paginatedTransactions,
        ),
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        organizations: validOrganizations,
        lastUpdatedAt: lastUpdatedAt
          ? new Date(lastUpdatedAt).toISOString()
          : null,
      };
    } catch (error) {
      console.error("Error in GetPersonalTransactionsBySlugUsecase:", error);
      throw error;
    }
  }

  private mapDisplayTypeToPersonalType(
    type?: DisplayTransactionType,
  ): "income" | "expense" | undefined {
    if (!type) return undefined;

    switch (type) {
      case "income":
        return "income";
      case "expense":
        return "expense";
      default:
        return undefined;
    }
  }
}
