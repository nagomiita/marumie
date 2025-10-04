import type { OrganizationRepository } from "../repositories/interfaces/organization-repository.interface";
import type { PersonalTransactionRepository } from "../repositories/interfaces/personal-transaction-repository.interface";

export interface GetPersonalMonthlyAggregationParams {
  slugs: string[];
  financialYear: number;
}

export interface MonthlyAggregationData {
  yearMonth: string;
  income: number;
  expense: number;
}

export interface GetPersonalMonthlyAggregationResult {
  monthlyData: MonthlyAggregationData[];
}

export class GetPersonalMonthlyAggregationUsecase {
  constructor(
    private personalTransactionRepository: PersonalTransactionRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    params: GetPersonalMonthlyAggregationParams,
  ): Promise<GetPersonalMonthlyAggregationResult> {
    try {
      const organizations = await Promise.all(
        params.slugs.map((slug) =>
          this.organizationRepository.findBySlug(slug),
        ),
      );

      const validOrganizations = organizations.filter((org) => org !== null);

      if (validOrganizations.length === 0) {
        throw new Error(
          `Organizations not found for slugs: ${params.slugs.join(", ")}`,
        );
      }

      // 全組織の月次データを取得して統合
      const allMonthlyData: Record<
        number,
        { income: number; expense: number }
      > = {};

      // 4月〜3月の12ヶ月分を初期化
      for (let month = 4; month <= 15; month++) {
        const actualMonth = month > 12 ? month - 12 : month;
        allMonthlyData[actualMonth] = { income: 0, expense: 0 };
      }

      // 各組織のデータを取得して合計
      for (const org of validOrganizations) {
        const monthlyData =
          await this.personalTransactionRepository.getMonthlyAggregation(
            org.slug,
            params.financialYear,
          );

        monthlyData.forEach((data) => {
          if (allMonthlyData[data.month]) {
            allMonthlyData[data.month].income += data.totalIncome;
            allMonthlyData[data.month].expense += data.totalExpense;
          }
        });
      }

      // 配列形式に変換（4月〜3月の順序）
      const monthlyArray: MonthlyAggregationData[] = [];
      for (let month = 4; month <= 15; month++) {
        const actualMonth = month > 12 ? month - 12 : month;
        const data = allMonthlyData[actualMonth];

        // yearMonthを生成 (YYYY-MM形式)
        const year =
          month <= 12 ? params.financialYear : params.financialYear + 1;
        const yearMonth = `${year}-${actualMonth.toString().padStart(2, "0")}`;

        monthlyArray.push({
          yearMonth,
          income: data.income,
          expense: data.expense,
        });
      }

      return {
        monthlyData: monthlyArray,
      };
    } catch (error) {
      console.error("Error in GetPersonalMonthlyAggregationUsecase:", error);
      throw error;
    }
  }
}
