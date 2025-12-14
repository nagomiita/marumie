import "server-only";

import { prisma } from "@/server/lib/prisma";
import { PrismaPoliticalOrganizationRepository } from "@/server/repositories/prisma-political-organization.repository";
import { PrismaTransactionRepository } from "@/server/repositories/prisma-transaction.repository";
import { withServerCache } from "@/server/utils/cache";
import {
  type GetTransactionsBySlugParams,
  GetTransactionsBySlugUsecase,
} from "@/server/usecases/get-transactions-by-slug-usecase";

export const loadTransactionsPageData = (
  params: GetTransactionsBySlugParams,
) => {
  const cacheKey = ["transactions-page-data", JSON.stringify(params)];

  return withServerCache(async () => {
    const transactionRepository = new PrismaTransactionRepository(prisma);
    const politicalOrganizationRepository =
      new PrismaPoliticalOrganizationRepository(prisma);
    const usecase = new GetTransactionsBySlugUsecase(
      transactionRepository,
      politicalOrganizationRepository,
    );

    return await usecase.execute(params);
  }, cacheKey)();
};
