import "server-only";

import { prisma } from "@/server/lib/prisma";
import { PrismaPersonalTransactionRepository } from "@/server/repositories/prisma-personal-transaction.repository";
import { PrismaOrganizationRepository } from "@/server/repositories/prisma-organization.repository";
import { withServerCache } from "@/server/utils/cache";
import { GetPersonalTransactionsBySlugUsecase } from "@/server/usecases/get-personal-transactions-by-slug-usecase";
import type { GetPersonalTransactionsBySlugParams } from "@/server/usecases/get-personal-transactions-by-slug-usecase";

const CACHE_REVALIDATE_SECONDS = 300;

export const loadPersonalTransactionsPageData = withServerCache(
  async (params: GetPersonalTransactionsBySlugParams) => {
    const personalTransactionRepository =
      new PrismaPersonalTransactionRepository(prisma);
    const organizationRepository = new PrismaOrganizationRepository(prisma);

    const usecase = new GetPersonalTransactionsBySlugUsecase(
      personalTransactionRepository,
      organizationRepository,
    );

    return await usecase.execute(params);
  },
  ["personal-transactions-page-data"],
  { revalidate: CACHE_REVALIDATE_SECONDS },
);
