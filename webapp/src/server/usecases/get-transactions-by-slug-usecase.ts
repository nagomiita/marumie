import type { PoliticalOrganization } from "@/shared/models/political-organization";
import type { TransactionFilters } from "@/types/transaction-filters";
import type {
  DisplayTransaction,
  DisplayTransactionType,
} from "@/types/display-transaction";
import type { IPoliticalOrganizationRepository } from "../repositories/interfaces/political-organization-repository.interface";
import type {
  ITransactionRepository,
  PaginationOptions,
} from "../repositories/interfaces/transaction-repository.interface";
import { convertToDisplayTransactions } from "../utils/transaction-converter";

export interface GetTransactionsBySlugParams {
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

export interface GetTransactionsBySlugResult {
  transactions: DisplayTransaction[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  politicalOrganizations: PoliticalOrganization[];
  lastUpdatedAt: string | null;
}

export class GetTransactionsBySlugUsecase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private politicalOrganizationRepository: IPoliticalOrganizationRepository,
  ) {}

  async execute(
    params: GetTransactionsBySlugParams,
  ): Promise<GetTransactionsBySlugResult> {
    const startTime = Date.now();
    console.log("[GetTransactionsBySlugUsecase] Execute called", {
      params,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT_SET",
      nextCacheDisabled: process.env.NEXT_CACHE_DISABLED,
      vercelEnv: process.env.VERCEL_ENV,
    });

    try {
      const politicalOrganizations =
        await this.politicalOrganizationRepository.findBySlugs(params.slugs);

      console.log(
        "[GetTransactionsBySlugUsecase] Found political organizations:",
        {
          count: politicalOrganizations.length,
          organizations: politicalOrganizations.map((org) => ({
            id: org.id,
            slug: org.slug,
            displayName: org.displayName,
          })),
        },
      );

      if (politicalOrganizations.length === 0) {
        console.error(
          "[GetTransactionsBySlugUsecase] No political organizations found for slugs:",
          params.slugs,
        );
        throw new Error(
          `Political organizations with slugs "${params.slugs.join(", ")}" not found`,
        );
      }

      const page = Math.max(params.page || 1, 1);
      const perPage = Math.min(Math.max(params.perPage || 50, 1), 100);

      const organizationIds = politicalOrganizations.map((org) => org.id);
      const filters: TransactionFilters = {
        political_organization_ids: organizationIds,
      };

      if (params.transactionType) {
        filters.transaction_type = params.transactionType;
      }
      if (params.dateFrom) {
        filters.date_from = params.dateFrom;
      }
      if (params.dateTo) {
        filters.date_to = params.dateTo;
      }
      if (params.categories && params.categories.length > 0) {
        filters.category_keys = params.categories;
      }
      filters.financial_year = params.financialYear;

      console.log("[GetTransactionsBySlugUsecase] Built filters:", filters);

      const pagination: PaginationOptions = {
        page,
        perPage,
        sortBy: params.sortBy,
        order: params.order,
      };

      console.log(
        "[GetTransactionsBySlugUsecase] Pagination options:",
        pagination,
      );

      const [transactionResult, lastUpdatedAt] = await Promise.all([
        this.transactionRepository.findWithPagination(filters, pagination),
        this.transactionRepository.getLastUpdatedAt(),
      ]);

      console.log("[GetTransactionsBySlugUsecase] Repository results:", {
        transactionCount: transactionResult.items.length,
        total: transactionResult.total,
        totalPages: transactionResult.totalPages,
        lastUpdatedAt: lastUpdatedAt?.toISOString(),
      });

      const transactions = convertToDisplayTransactions(
        transactionResult.items,
      );
      const total = transactionResult.total;
      const totalPages = Math.ceil(total / perPage);

      const result = {
        transactions,
        total,
        page,
        perPage,
        totalPages,
        politicalOrganizations,
        lastUpdatedAt: lastUpdatedAt?.toISOString() ?? null,
      };

      const executionTime = Date.now() - startTime;
      console.log("[GetTransactionsBySlugUsecase] Final result:", {
        transactionCount: result.transactions.length,
        total: result.total,
        page: result.page,
        perPage: result.perPage,
        totalPages: result.totalPages,
        organizationCount: result.politicalOrganizations.length,
        lastUpdatedAt: result.lastUpdatedAt,
        executionTimeMs: executionTime,
      });

      return result;
    } catch (error) {
      console.error("[GetTransactionsBySlugUsecase] Error occurred:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        params,
      });
      throw new Error(
        `Failed to get transactions by slug: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
