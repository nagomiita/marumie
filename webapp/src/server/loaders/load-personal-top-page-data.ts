import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/server/lib/prisma";
import { PrismaPersonalTransactionRepository } from "@/server/repositories/prisma-personal-transaction.repository";
import { PrismaOrganizationRepository } from "@/server/repositories/prisma-organization.repository";
import { GetPersonalTransactionsBySlugUsecase } from "@/server/usecases/get-personal-transactions-by-slug-usecase";
import { GetPersonalMonthlyAggregationUsecase } from "@/server/usecases/get-personal-monthly-aggregation-usecase";
import { GetPersonalSankeyAggregationUsecase } from "@/server/usecases/get-personal-sankey-aggregation-usecase";
import type { GetPersonalTransactionsBySlugParams } from "@/server/usecases/get-personal-transactions-by-slug-usecase";

const CACHE_REVALIDATE_SECONDS = 3600;

export interface PersonalTopPageDataParams
  extends Omit<GetPersonalTransactionsBySlugParams, "financialYear"> {
  financialYear: number; // 必須項目として設定
}

export const loadPersonalTopPageData = unstable_cache(
  async (params: PersonalTopPageDataParams) => {
    // 実データを取得
    const personalTransactionRepository =
      new PrismaPersonalTransactionRepository(prisma);
    const organizationRepository = new PrismaOrganizationRepository(prisma);

    // UseCaseを初期化
    const transactionUsecase = new GetPersonalTransactionsBySlugUsecase(
      personalTransactionRepository,
      organizationRepository,
    );

    const monthlyUsecase = new GetPersonalMonthlyAggregationUsecase(
      personalTransactionRepository,
      organizationRepository,
    );

    const sankeyUsecase = new GetPersonalSankeyAggregationUsecase(
      personalTransactionRepository,
      organizationRepository,
    );

    // 基本的なデータを並列取得
    const [transactionData, monthlyData, sankeyData, summary] =
      await Promise.all([
        transactionUsecase.execute(params),
        monthlyUsecase.execute({
          slugs: params.slugs,
          financialYear: params.financialYear,
        }),
        sankeyUsecase.execute({
          slugs: params.slugs,
          financialYear: params.financialYear,
        }),
        // 個人家計簿では基本的な収支データのみ提供
        calculateFinancialSummary(
          personalTransactionRepository,
          params.slugs,
          params.financialYear,
        ),
      ]);

    return {
      transactionData,
      monthlyData: monthlyData.monthlyData,
      summary,
      sankeyData: sankeyData.sankeyData,
    };
  },
  ["personal-top-page-data"],
  { revalidate: CACHE_REVALIDATE_SECONDS },
);

// 財務サマリーの計算
async function calculateFinancialSummary(
  repository: PrismaPersonalTransactionRepository,
  slugs: string[],
  financialYear: number,
): Promise<{
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  categories: {
    income: Array<{ category: string; amount: number }>;
    expense: Array<{ category: string; amount: number }>;
  };
}> {
  const summaryData = {
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    categories: {
      income: [] as Array<{ category: string; amount: number }>,
      expense: [] as Array<{ category: string; amount: number }>,
    },
  };

  for (const slug of slugs) {
    // 年度の収入・支出合計を取得
    const [income, expense] = await Promise.all([
      repository.getTotalAmountByType(slug, "income", financialYear),
      repository.getTotalAmountByType(slug, "expense", financialYear),
    ]);

    summaryData.totalIncome += income;
    summaryData.totalExpense += expense;

    // カテゴリ別集計を取得
    const categoryData = await repository.getCategoryAggregation(
      slug,
      financialYear,
    );

    categoryData.forEach((cat) => {
      if (cat.type === "income") {
        const existing = summaryData.categories.income.find(
          (c) => c.category === cat.category,
        );
        if (existing) {
          existing.amount += cat.totalAmount;
        } else {
          summaryData.categories.income.push({
            category: cat.category,
            amount: cat.totalAmount,
          });
        }
      } else {
        const existing = summaryData.categories.expense.find(
          (c) => c.category === cat.category,
        );
        if (existing) {
          existing.amount += cat.totalAmount;
        } else {
          summaryData.categories.expense.push({
            category: cat.category,
            amount: cat.totalAmount,
          });
        }
      }
    });
  }

  summaryData.netAmount = summaryData.totalIncome - summaryData.totalExpense;

  // カテゴリを金額順でソート
  summaryData.categories.income.sort((a, b) => b.amount - a.amount);
  summaryData.categories.expense.sort((a, b) => b.amount - a.amount);

  return summaryData;
}
