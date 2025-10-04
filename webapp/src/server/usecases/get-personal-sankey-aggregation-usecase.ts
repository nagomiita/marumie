import "server-only";

import type { SankeyData } from "@/types/sankey";
import type { PersonalTransactionRepository } from "../repositories/interfaces/personal-transaction-repository.interface";
import type { OrganizationRepository } from "../repositories/interfaces/organization-repository.interface";

export interface GetPersonalSankeyAggregationParams {
  slugs: string[];
  financialYear: number;
  month?: number; // 特定月のデータを取得（1-12）、未指定の場合は年間データ
  categoryType?: "income" | "expense";
}

export interface GetPersonalSankeyAggregationResult {
  sankeyData: SankeyData;
}

export class GetPersonalSankeyAggregationUsecase {
  constructor(
    private personalTransactionRepository: PersonalTransactionRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    params: GetPersonalSankeyAggregationParams,
  ): Promise<GetPersonalSankeyAggregationResult> {
    try {
      // 組織を取得（複数のslugに対応）
      const organizations = await Promise.all(
        params.slugs.map((slug) =>
          this.organizationRepository.findBySlug(slug),
        ),
      );

      const validOrganizations = organizations.filter((org) => org !== null);

      if (validOrganizations.length === 0) {
        throw new Error(
          `Organizations with slugs "${params.slugs.join(", ")}" not found`,
        );
      }

      // 個人取引データから簡素化されたサンキーデータを生成
      const sankeyData = await this.generatePersonalSankeyData(
        params.slugs,
        params.financialYear,
        params.month,
      );

      return { sankeyData };
    } catch (error) {
      throw new Error(
        `Failed to get personal sankey aggregation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async generatePersonalSankeyData(
    slugs: string[],
    financialYear: number,
    month?: number,
  ): Promise<SankeyData> {
    // 各カテゴリの集計データを取得（月指定対応）
    const categoryAggregations = await Promise.all(
      slugs.map((slug) =>
        this.personalTransactionRepository.getCategoryAggregation(
          slug,
          financialYear,
          month,
        ),
      ),
    );

    // 全スラグのデータを統合
    const aggregatedData = categoryAggregations.flat();

    // 収入と支出の合計を計算
    const totalIncome = aggregatedData
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.totalAmount, 0);

    const totalExpense = aggregatedData
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.totalAmount, 0);

    const netAmount = totalIncome - totalExpense;

    // ノードを生成
    const nodes = [
      // 収入カテゴリ
      ...aggregatedData
        .filter((item) => item.type === "income")
        .map((item) => ({
          id: `income-${item.category}`,
          label: item.category,
          nodeType: "income" as const,
        })),
      // 合計ノード
      {
        id: "total",
        label: "合計",
        nodeType: "total" as const,
      },
      // 現金残高ノード
      {
        id: "cash-balance",
        label: "現金残高",
        nodeType: "expense" as const,
      },
      // 支出カテゴリ
      ...aggregatedData
        .filter((item) => item.type === "expense")
        .map((item) => ({
          id: `expense-${item.category}`,
          label: item.category,
          nodeType: "expense-sub" as const,
        })),
    ];

    // リンクを生成
    const links = [
      // 収入から合計へのリンク
      ...aggregatedData
        .filter((item) => item.type === "income")
        .map((item) => ({
          source: `income-${item.category}`,
          target: "total",
          value: item.totalAmount,
        })),
      // 合計から現金残高へのリンク
      {
        source: "total",
        target: "cash-balance",
        value: totalIncome,
      },
      // 現金残高から支出カテゴリへのリンク
      ...aggregatedData
        .filter((item) => item.type === "expense")
        .map((item) => ({
          source: "cash-balance",
          target: `expense-${item.category}`,
          value: item.totalAmount,
        })),
    ];

    return {
      nodes,
      links,
      totalLatestBalance: netAmount,
    };
  }
}
