import "server-only";

import { prisma } from "@/server/lib/prisma";
import { PrismaPoliticalOrganizationRepository } from "@/server/repositories/prisma-political-organization.repository";
import { PrismaTransactionRepository } from "@/server/repositories/prisma-transaction.repository";
import { PrismaBalanceSnapshotRepository } from "@/server/repositories/prisma-balance-snapshot.repository";
import { withServerCache } from "@/server/utils/cache";
import { GetBalanceSheetUsecase } from "@/server/usecases/get-balance-sheet-usecase";
import { GetMockTransactionPageDataUsecase } from "@/server/usecases/get-mock-transaction-page-data-usecase";
import { GetMonthlyTransactionAggregationUsecase } from "@/server/usecases/get-monthly-transaction-aggregation-usecase";
import { GetSankeyAggregationUsecase } from "@/server/usecases/get-sankey-aggregation-usecase";
import {
  type GetTransactionsBySlugParams,
  GetTransactionsBySlugUsecase,
} from "@/server/usecases/get-transactions-by-slug-usecase";

// 開発環境ではキャッシュを無効化、本番環境では1時間
const CACHE_REVALIDATE_SECONDS = 3600;

export interface TopPageDataParams
  extends Omit<GetTransactionsBySlugParams, "financialYear"> {
  financialYear: number; // 必須項目として設定
}

export const loadTopPageData = withServerCache(
  async (params: TopPageDataParams) => {
    console.log("[loadTopPageData] Called with params:", {
      params,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      useMockData: process.env.USE_MOCK_DATA,
    });

    // モックデータを使用する場合
    if (process.env.USE_MOCK_DATA === "true") {
      console.log("[loadTopPageData] Using mock data");
      const mockUsecase = new GetMockTransactionPageDataUsecase();
      return await mockUsecase.execute(params);
    }

    console.log(
      "[loadTopPageData] Using real data, initializing repositories and usecases",
    );

    // 実データを取得する場合
    const transactionRepository = new PrismaTransactionRepository(prisma);
    const politicalOrganizationRepository =
      new PrismaPoliticalOrganizationRepository(prisma);
    const balanceSnapshotRepository = new PrismaBalanceSnapshotRepository(
      prisma,
    );

    // 5つのUsecaseを初期化
    const transactionUsecase = new GetTransactionsBySlugUsecase(
      transactionRepository,
      politicalOrganizationRepository,
    );

    const monthlyUsecase = new GetMonthlyTransactionAggregationUsecase(
      transactionRepository,
      politicalOrganizationRepository,
    );

    const sankeyUsecase = new GetSankeyAggregationUsecase(
      transactionRepository,
      politicalOrganizationRepository,
      balanceSnapshotRepository,
    );

    const balanceSheetUsecase = new GetBalanceSheetUsecase(
      transactionRepository,
      balanceSnapshotRepository,
      politicalOrganizationRepository,
    );

    console.log("[loadTopPageData] Starting parallel execution of usecases");

    try {
      // 5つのUsecaseを並列実行（sankeyは2回実行）
      const [
        transactionData,
        monthlyData,
        sankeyPoliticalCategoryData,
        sankeyFriendlyCategoryData,
        balanceSheetData,
      ] = await Promise.all([
        transactionUsecase.execute(params),
        monthlyUsecase.execute({
          slugs: params.slugs,
          financialYear: params.financialYear,
        }),
        sankeyUsecase.execute({
          slugs: params.slugs,
          financialYear: params.financialYear,
          categoryType: "political-category",
        }),
        sankeyUsecase.execute({
          slugs: params.slugs,
          financialYear: params.financialYear,
          categoryType: "friendly-category",
        }),
        balanceSheetUsecase.execute({
          slugs: params.slugs,
          financialYear: params.financialYear,
        }),
      ]);

      console.log("[loadTopPageData] All usecases completed successfully", {
        transactionCount: transactionData.transactions.length,
        monthlyDataPoints: monthlyData.monthlyData.length,
        politicalSankeyNodes:
          sankeyPoliticalCategoryData.sankeyData.nodes.length,
        friendlySankeyNodes: sankeyFriendlyCategoryData.sankeyData.nodes.length,
        balanceSheetData: {
          currentAssets: balanceSheetData.balanceSheetData.left.currentAssets,
          currentLiabilities:
            balanceSheetData.balanceSheetData.right.currentLiabilities,
          netAssets: balanceSheetData.balanceSheetData.right.netAssets,
        },
      });

      return {
        transactionData,
        monthlyData: monthlyData.monthlyData,
        political: sankeyPoliticalCategoryData.sankeyData,
        friendly: sankeyFriendlyCategoryData.sankeyData,
        balanceSheetData: balanceSheetData.balanceSheetData,
      };
    } catch (error) {
      console.error("[loadTopPageData] Error during usecase execution:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        params,
      });
      throw error;
    }
  },
  ["top-page-data"],
  { revalidate: CACHE_REVALIDATE_SECONDS },
);
