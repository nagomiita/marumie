"use server";

import { prisma } from "@/server/lib/prisma";
import { PrismaPersonalTransactionRepository } from "@/server/repositories/prisma-personal-transaction.repository";
import { SavePersonalTransactionsUsecase } from "@/server/usecases/save-personal-transactions-usecase";
import type { SavePersonalTransactionsResult } from "@/server/usecases/save-personal-transactions-usecase";
import type { PersonalTransactionPreview } from "@/shared/models/personal-transaction";

const personalTransactionRepository = new PrismaPersonalTransactionRepository(
  prisma,
);
const saveUsecase = new SavePersonalTransactionsUsecase(
  personalTransactionRepository,
);

export interface UploadPersonalCsvRequest {
  validTransactions: PersonalTransactionPreview[];
  organizationId?: string;
}

export type UploadPersonalCsvResponse = SavePersonalTransactionsResult;

export async function uploadPersonalCsv(
  data: UploadPersonalCsvRequest,
): Promise<UploadPersonalCsvResponse> {
  "use server";
  try {
    const { validTransactions, organizationId } = data;

    if (!validTransactions || validTransactions.length === 0) {
      return {
        ok: false,
        message: "保存可能なトランザクションがありません",
        processedCount: 0,
        savedCount: 0,
      };
    }

    const result = await saveUsecase.execute({
      validTransactions,
      organizationId,
    });

    return result;
  } catch (error) {
    console.error("Upload personal CSV error:", error);

    return {
      ok: false,
      message: "アップロード中にエラーが発生しました",
      processedCount: 0,
      savedCount: 0,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  } finally {
    await prisma.$disconnect();
  }
}
