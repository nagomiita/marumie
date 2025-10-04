import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/server/lib/prisma";
import { PrismaPersonalTransactionRepository } from "@/server/repositories/prisma-personal-transaction.repository";
import { PrismaOrganizationRepository } from "@/server/repositories/prisma-organization.repository";
import { GetPersonalTransactionsBySlugUsecase } from "@/server/usecases/get-personal-transactions-by-slug-usecase";
import type { GetPersonalTransactionsBySlugParams } from "@/server/usecases/get-personal-transactions-by-slug-usecase";

const CACHE_REVALIDATE_SECONDS = 300; // 5 minutes

export const loadPersonalTransactionsPageData = unstable_cache(
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
