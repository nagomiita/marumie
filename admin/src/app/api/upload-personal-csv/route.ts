import { NextRequest, NextResponse } from "next/server";
import {
  uploadPersonalCsv,
  type UploadPersonalCsvRequest,
  type UploadPersonalCsvResponse,
} from "@/server/actions/upload-personal-csv";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const payload = (await request.json()) as Partial<UploadPersonalCsvRequest>;

    if (!payload || !Array.isArray(payload.validTransactions)) {
      return NextResponse.json<UploadPersonalCsvResponse>(
        {
          ok: false,
          message: "有効なトランザクションデータが指定されていません",
          processedCount: 0,
          savedCount: 0,
          errors: ["validTransactions が必要です"],
        },
        { status: 400 },
      );
    }

    const result = await uploadPersonalCsv({
      validTransactions: payload.validTransactions,
      organizationId: payload.organizationId,
    });

    return NextResponse.json<UploadPersonalCsvResponse>(result, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? "リクエストボディのJSON解析に失敗しました"
        : error instanceof Error
          ? error.message
          : "アップロード処理中に不明なエラーが発生しました";

    console.error("[ERROR] Upload personal CSV API error:", {
      message,
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
    });

    const responseBody: UploadPersonalCsvResponse = {
      ok: false,
      message,
      processedCount: 0,
      savedCount: 0,
      errors: [message],
    };

    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json(responseBody, { status });
  }
}
