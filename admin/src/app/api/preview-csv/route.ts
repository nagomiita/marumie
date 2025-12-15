import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const organizationId =
      (formData.get("organizationId") as string) || undefined;

    console.log("[DEBUG] CSV Preview API Start:", {
      fileName: file?.name,
      fileSize: file?.size,
      organizationId,
      timestamp: new Date().toISOString(),
    });

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 },
      );
    }

    console.log("[DEBUG] File validation passed");

    const contentStart = Date.now();
    const csvContent = await file.text();
    console.log("[DEBUG] Content processing completed:", {
      duration: Date.now() - contentStart,
      contentLength: csvContent.length,
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

    // デバッグ: JSON化可能か確認
    try {
      const testSerialize = JSON.stringify(result);
      console.log(
        "[DEBUG] JSON serialization successful, size:",
        testSerialize.length,
      );
    } catch (serializeError) {
      console.error("[ERROR] JSON serialization failed:", {
        error:
          serializeError instanceof Error
            ? serializeError.message
            : String(serializeError),
        resultKeys: Object.keys(result),
        transactionCount: result.transactions.length,
      });
      // First transaction を詳しく確認
      if (result.transactions.length > 0) {
        console.error("[ERROR] First transaction structure:", {
          transaction: result.transactions[0],
          keys: Object.keys(result.transactions[0] ?? {}),
        });
      }
      throw serializeError;
    }
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ERROR] Preview CSV API error:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: errorMessage || "サーバー内部エラーが発生しました" },
      { status: 500 },
    );
  }
}
