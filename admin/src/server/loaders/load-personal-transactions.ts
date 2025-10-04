import "server-only";

import { prisma } from "@/server/lib/prisma";
import type { PersonalTransaction } from "@/shared/models/personal-transaction";

export interface LoadPersonalTransactionsOptions {
  organizationId?: string;
  limit?: number;
  offset?: number;
}

export async function loadPersonalTransactions(
  options: LoadPersonalTransactionsOptions = {},
): Promise<PersonalTransaction[]> {
  try {
    const where: any = {};

    if (options.organizationId) {
      where.organizationId = options.organizationId;
    }

    const transactions = await prisma.personalTransaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: options.limit || 100,
      skip: options.offset || 0,
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      date: transaction.date,
      category: transaction.category,
      subcategory: transaction.subcategory || undefined,
      amount: Number(transaction.amount),
      type: transaction.type,
      payment_method: transaction.paymentMethod,
      description: transaction.description,
      memo: transaction.memo || undefined,
      hash: transaction.hash,
      created_at: transaction.createdAt,
      updated_at: transaction.updatedAt,
    }));
  } catch (error) {
    console.error("Error loading personal transactions:", error);
    throw new Error("取引データの読み込みに失敗しました");
  } finally {
    await prisma.$disconnect();
  }
}
