import type { PrismaClient } from "@prisma/client";
import type {
  PersonalTransaction,
  PersonalTransactionFilters,
} from "@/types/personal-transaction";
import type { PersonalTransactionRepository } from "./interfaces/personal-transaction-repository.interface";

export class PrismaPersonalTransactionRepository
  implements PersonalTransactionRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(
    filters: PersonalTransactionFilters,
  ): Promise<PersonalTransaction[]> {
    const where = this.buildWhereClause(filters);

    const records = await this.prisma.personalTransaction.findMany({
      where,
      include: {
        organization: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });

    return records.map(this.mapToPersonalTransaction);
  }

  async count(filters: PersonalTransactionFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return await this.prisma.personalTransaction.count({ where });
  }

  async findByOrganizationSlug(
    slug: string,
    filters?: Omit<PersonalTransactionFilters, "organizationSlug">,
  ): Promise<PersonalTransaction[]> {
    return this.findMany({
      ...filters,
      organizationSlug: slug,
    });
  }

  async getTotalAmountByType(
    organizationSlug: string,
    type: "income" | "expense",
    financialYear?: number,
  ): Promise<number> {
    const where: any = {
      organization: {
        slug: organizationSlug,
      },
      type,
    };

    if (financialYear) {
      const startDate = new Date(financialYear, 3, 1); // 4月1日
      const endDate = new Date(financialYear + 1, 2, 31); // 翌年3月31日
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const result = await this.prisma.personalTransaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount || 0);
  }

  async getMonthlyAggregation(
    organizationSlug: string,
    financialYear: number,
  ): Promise<
    Array<{
      month: number;
      totalIncome: number;
      totalExpense: number;
      netAmount: number;
    }>
  > {
    const startDate = new Date(financialYear, 3, 1); // 4月1日
    const endDate = new Date(financialYear + 1, 2, 31); // 翌年3月31日

    const transactions = await this.prisma.personalTransaction.findMany({
      where: {
        organization: {
          slug: organizationSlug,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        amount: true,
        type: true,
      },
    });

    // 月別の集計
    const monthlyData: Record<number, { income: number; expense: number }> = {};

    for (let month = 4; month <= 15; month++) {
      const actualMonth = month > 12 ? month - 12 : month;
      monthlyData[actualMonth] = { income: 0, expense: 0 };
    }

    transactions.forEach((transaction) => {
      const month = transaction.date.getMonth() + 1;
      const amount = Number(transaction.amount);

      if (transaction.type === "income") {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expense += amount;
      }
    });

    // 結果を配列に変換
    const result = [];
    for (let month = 4; month <= 15; month++) {
      const actualMonth = month > 12 ? month - 12 : month;
      const data = monthlyData[actualMonth];
      result.push({
        month: actualMonth,
        totalIncome: data.income,
        totalExpense: data.expense,
        netAmount: data.income - data.expense,
      });
    }

    return result;
  }

  async getCategoryAggregation(
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
  > {
    const where: any = {
      organization: {
        slug: organizationSlug,
      },
    };

    if (financialYear && month) {
      // 特定月のデータを取得
      const startDate = new Date(financialYear, month - 1, 1); // 月初
      const endDate = new Date(financialYear, month, 0); // 月末
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (financialYear) {
      // 年度のデータを取得
      const startDate = new Date(financialYear, 3, 1); // 4月1日
      const endDate = new Date(financialYear + 1, 2, 31); // 翌年3月31日
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await this.prisma.personalTransaction.findMany({
      where,
      select: {
        category: true,
        subcategory: true,
        type: true,
        amount: true,
      },
    });

    // カテゴリ別集計
    const categoryMap: Record<
      string,
      {
        category: string;
        subcategory?: string;
        type: "income" | "expense";
        totalAmount: number;
        count: number;
      }
    > = {};

    transactions.forEach((transaction) => {
      const key = `${transaction.category}:${transaction.subcategory || ""}:${transaction.type}`;

      if (!categoryMap[key]) {
        categoryMap[key] = {
          category: transaction.category,
          subcategory: transaction.subcategory || undefined,
          type: transaction.type,
          totalAmount: 0,
          count: 0,
        };
      }

      categoryMap[key].totalAmount += Number(transaction.amount);
      categoryMap[key].count += 1;
    });

    return Object.values(categoryMap);
  }

  private buildWhereClause(filters: PersonalTransactionFilters): any {
    const where: any = {};

    if (filters.organizationSlug) {
      where.organization = {
        slug: filters.organizationSlug,
      };
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    return where;
  }

  private mapToPersonalTransaction(record: any): PersonalTransaction {
    return {
      id: record.id,
      date: record.date,
      category: record.category,
      subcategory: record.subcategory || undefined,
      amount: Number(record.amount),
      type: record.type,
      payment_method: record.paymentMethod,
      description: record.description,
      memo: record.memo || undefined,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
      organizationId: record.organizationId,
    };
  }
}
