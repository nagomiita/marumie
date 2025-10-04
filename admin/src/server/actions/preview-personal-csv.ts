"use server";

import { bufferToString } from "@/server/lib/encoding-converter";
import { prisma } from "@/server/lib/prisma";
import { PrismaPersonalTransactionRepository } from "@/server/repositories/prisma-personal-transaction.repository";
import { PreviewPersonalCsvUsecase } from "@/server/usecases/preview-personal-csv-usecase";
import type { PreviewPersonalCsvResult } from "@/server/usecases/preview-personal-csv-usecase";

const personalTransactionRepository = new PrismaPersonalTransactionRepository(
  prisma,
);
const previewUsecase = new PreviewPersonalCsvUsecase(
  personalTransactionRepository,
);

export interface PreviewPersonalCsvRequest {
  file: File;
  organizationId?: string;
}

export async function previewPersonalCsv(
  data: PreviewPersonalCsvRequest,
): Promise<PreviewPersonalCsvResult> {
  "use server";
  const startTime = Date.now();
  console.log("[DEBUG] CSV Preview Start:", {
    fileName: data.file?.name,
    fileSize: data.file?.size,
    organizationId: data.organizationId,
    timestamp: new Date().toISOString(),
  });

  try {
    const { file, organizationId } = data;

    if (!file) {
      throw new Error("ファイルが選択されていません");
    }

    console.log("[DEBUG] File validation passed");

    // Convert file to buffer and then to properly encoded string
    const bufferStart = Date.now();
    const csvBuffer = Buffer.from(await file.arrayBuffer());
    console.log("[DEBUG] Buffer conversion completed:", {
      duration: Date.now() - bufferStart,
      bufferSize: csvBuffer.length,
    });

    const encodingStart = Date.now();
    const csvContent = bufferToString(csvBuffer);
    console.log("[DEBUG] Encoding conversion completed:", {
      duration: Date.now() - encodingStart,
      contentLength: csvContent.length,
      contentPreview: csvContent.substring(0, 100),
    });

    const usecaseStart = Date.now();
    const result = await previewUsecase.execute({
      csvContent,
      organizationId,
    });
    console.log("[DEBUG] Usecase execution completed:", {
      duration: Date.now() - usecaseStart,
      transactionCount: result.transactions.length,
      errorCount: result.errors.length,
    });

    console.log("[DEBUG] CSV Preview Success:", {
      totalDuration: Date.now() - startTime,
      summary: result.summary,
    });

    return result;
  } catch (error) {
    console.error("[ERROR] Preview personal CSV error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
    throw error instanceof Error
      ? error
      : new Error("サーバー内部エラーが発生しました");
  } finally {
    const disconnectStart = Date.now();
    await prisma.$disconnect();
    console.log("[DEBUG] Prisma disconnect completed:", {
      duration: Date.now() - disconnectStart,
      totalDuration: Date.now() - startTime,
    });
  }
}
