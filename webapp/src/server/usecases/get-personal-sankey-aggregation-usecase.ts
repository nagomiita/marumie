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

    // カテゴリ別の合計を計算（サブカテゴリがある場合はカテゴリごとに集計）
    const categoryTotals: Record<
      string,
      { type: "income" | "expense"; total: number }
    > = {};

    aggregatedData.forEach((item) => {
      const key = `${item.type}-${item.category}`;
      if (!categoryTotals[key]) {
        categoryTotals[key] = { type: item.type, total: 0 };
      }
      categoryTotals[key].total += item.totalAmount;
    });

    // 収入と支出の合計を計算
    const totalIncome = aggregatedData
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.totalAmount, 0);

    const totalExpense = aggregatedData
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.totalAmount, 0);

    const netAmount = totalIncome - totalExpense;

    // データが実質的に空の場合は空のサンキーデータを返す
    // （収入も支出もない場合、サンキー図は意味がない）
    if (totalIncome === 0 && totalExpense === 0) {
      console.log("No income or expense data, returning empty sankey");
      return {
        nodes: [],
        links: [],
        totalLatestBalance: 0,
      };
    }

    // ノードを生成
    const nodes: Array<{
      id: string;
      label: string;
      nodeType: "income" | "income-sub" | "total" | "expense" | "expense-sub";
    }> = [];
    const links: Array<{
      source: string;
      target: string;
      value: number;
    }> = [];

    // 収入側のノードとリンクを生成
    aggregatedData
      .filter((item) => item.type === "income" && item.totalAmount > 0)
      .forEach((item) => {
        if (item.subcategory) {
          // サブカテゴリノード
          const subId = `income-sub-${item.category}-${item.subcategory}`;
          const catId = `income-${item.category}`;

          // サブカテゴリノードを追加
          if (!nodes.find((n) => n.id === subId)) {
            nodes.push({
              id: subId,
              label: item.subcategory,
              nodeType: "income-sub" as const,
            });
          }

          // カテゴリノードを追加
          if (!nodes.find((n) => n.id === catId)) {
            nodes.push({
              id: catId,
              label: item.category,
              nodeType: "income" as const,
            });
          }

          // サブカテゴリ → カテゴリへのリンク
          links.push({
            source: subId,
            target: catId,
            value: item.totalAmount,
          });
        } else {
          // カテゴリのみ（サブカテゴリなし）
          const catId = `income-${item.category}`;
          if (!nodes.find((n) => n.id === catId)) {
            nodes.push({
              id: catId,
              label: item.category,
              nodeType: "income" as const,
            });
          }
        }
      });

    // 収入カテゴリ → 合計へのリンク
    Object.entries(categoryTotals)
      .filter(([, data]) => data.type === "income" && data.total > 0)
      .forEach(([key, data]) => {
        const category = key.replace("income-", "");
        links.push({
          source: `income-${category}`,
          target: "total",
          value: data.total,
        });
      });

    // 合計ノード
    nodes.push({
      id: "total",
      label: "合計",
      nodeType: "total" as const,
    });

    // 支出側のノードとリンクを生成
    aggregatedData
      .filter((item) => item.type === "expense" && item.totalAmount > 0)
      .forEach((item) => {
        if (item.subcategory) {
          // サブカテゴリノード
          const subId = `expense-sub-${item.category}-${item.subcategory}`;
          const catId = `expense-${item.category}`;

          // カテゴリノードを追加
          if (!nodes.find((n) => n.id === catId)) {
            nodes.push({
              id: catId,
              label: item.category,
              nodeType: "expense" as const,
            });
          }

          // サブカテゴリノードを追加
          if (!nodes.find((n) => n.id === subId)) {
            nodes.push({
              id: subId,
              label: item.subcategory,
              nodeType: "expense-sub" as const,
            });
          }

          // カテゴリ → サブカテゴリへのリンク
          links.push({
            source: catId,
            target: subId,
            value: item.totalAmount,
          });
        } else {
          // カテゴリのみ（サブカテゴリなし）
          const catId = `expense-${item.category}`;
          if (!nodes.find((n) => n.id === catId)) {
            nodes.push({
              id: catId,
              label: item.category,
              nodeType: "expense" as const,
            });
          }
        }
      });

    // 合計 → 支出カテゴリへのリンク
    Object.entries(categoryTotals)
      .filter(([, data]) => data.type === "expense" && data.total > 0)
      .forEach(([key, data]) => {
        const category = key.replace("expense-", "");
        links.push({
          source: "total",
          target: `expense-${category}`,
          value: data.total,
        });
      });

    // 残高がプラスの場合、「現金残高」ノードとリンクを追加
    const balanceChange = totalIncome - totalExpense;
    if (balanceChange > 0) {
      nodes.push({
        id: "cash-balance",
        label: "現金残高",
        nodeType: "expense" as const,
      });
      links.push({
        source: "total",
        target: "cash-balance",
        value: balanceChange,
      });
    }

    // データ検証：すべての値が有効な数値であることを確認
    const validatedLinks = links.map((link) => ({
      ...link,
      value: Number.isFinite(link.value) && link.value > 0 ? link.value : 0,
    }));

    // 合計ノードへの入力
    const totalInputs = validatedLinks
      .filter((link) => link.target === "total")
      .reduce((sum, link) => sum + link.value, 0);

    // 合計ノードからの出力
    const totalOutputs = validatedLinks
      .filter((link) => link.source === "total")
      .reduce((sum, link) => sum + link.value, 0);

    console.log("Total node inputs:", totalInputs);
    console.log("Total node outputs:", totalOutputs);

    if (Math.abs(totalInputs - totalOutputs) > 0.01) {
      console.warn(
        "Warning: Total node input/output mismatch:",
        totalInputs,
        "vs",
        totalOutputs,
      );
    }

    return {
      nodes,
      links: validatedLinks,
      totalLatestBalance: netAmount,
    };
  }
}
