import { PersonalCsvLoader } from "@/server/lib/personal-csv-loader";
import { PersonalTransactionHash } from "@/server/lib/personal-transaction-hash";
import type { PersonalTransactionRepository } from "@/server/repositories/interfaces/personal-transaction-repository.interface";
import type { PersonalTransactionPreview } from "@/shared/models/personal-transaction";

export interface PreviewPersonalCsvRequest {
  csvContent: string;
  organizationId?: string;
}

export interface PreviewPersonalCsvResult {
  transactions: PersonalTransactionPreview[];
  summary: {
    totalCount: number;
    insertCount: number;
    updateCount: number;
    duplicateCount: number;
    errorCount: number;
  };
  errors: string[];
}

export class PreviewPersonalCsvUsecase {
  constructor(
    private readonly personalTransactionRepository: PersonalTransactionRepository,
  ) {}

  async execute(
    request: PreviewPersonalCsvRequest,
  ): Promise<PreviewPersonalCsvResult> {
    const startTime = Date.now();
    const { csvContent, organizationId } = request;
    console.log("[DEBUG] Usecase execution start:", {
      contentLength: csvContent.length,
      organizationId,
      timestamp: new Date().toISOString(),
    });

    const loader = new PersonalCsvLoader();
    const errors: string[] = [];
    const transactions: PersonalTransactionPreview[] = [];

    try {
      // Load and parse CSV data
      const loadStart = Date.now();
      const csvData = loader.load(csvContent);
      console.log("[DEBUG] CSV parsing completed:", {
        duration: Date.now() - loadStart,
        recordCount: csvData.length,
      });

      // Generate all hashes at once for batch processing
      const hashRecords: { hash: string; index: number; record: any }[] = [];
      const validRecords: { index: number; record: any; hash: string }[] = [];

      // First pass: validate data and generate hashes
      const hashStart = Date.now();
      console.log(
        "[DEBUG] Starting hash generation for",
        csvData.length,
        "records",
      );

      for (let i = 0; i < csvData.length; i++) {
        const record = csvData[i];
        const lineNumber = i + 2; // CSV line number (header is line 1)

        try {
          // Generate hash for duplicate detection
          const hash = PersonalTransactionHash.generate(record, organizationId);
          hashRecords.push({ hash, index: i, record });
          validRecords.push({ index: i, record, hash });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push(`行 ${lineNumber}: ${errorMessage}`);

          // Add error transaction for display
          transactions.push({
            id: `error-${i}`,
            date: "",
            category: record.category || "",
            subcategory: record.subcategory,
            amount: record.amount || 0,
            type: record.type || "expense",
            paymentMethod: record.paymentMethod || "",
            description: record.description || "",
            memo: record.memo,
            status: "error",
            errors: [errorMessage],
          });
        }
      }

      console.log("[DEBUG] Hash generation completed:", {
        duration: Date.now() - hashStart,
        validRecords: validRecords.length,
        errorRecords: csvData.length - validRecords.length,
      });

      // Batch DB query: get all existing transactions at once
      const dbStart = Date.now();
      const existingHashes = new Set<string>();
      if (hashRecords.length > 0) {
        console.log(
          "[DEBUG] Starting batch DB query for",
          hashRecords.length,
          "hashes",
        );
        const hashes = hashRecords.map((hr) => hr.hash);
        const existingTransactions =
          await this.personalTransactionRepository.findByHashes(hashes);
        console.log("[DEBUG] DB query completed:", {
          duration: Date.now() - dbStart,
          existingCount: existingTransactions.length,
        });
        existingTransactions.forEach((t) => {
          existingHashes.add(t.hash);
        });
      } else {
        console.log("[DEBUG] No hashes to query");
      }

      // Second pass: create preview transactions using batch results
      const previewStart = Date.now();
      console.log("[DEBUG] Starting preview generation");

      for (const { index, record, hash } of validRecords) {
        const preview: PersonalTransactionPreview = {
          id: `preview-${index}`,
          date: record.date.toISOString().split("T")[0],
          category: record.category,
          subcategory: record.subcategory,
          amount: record.amount,
          type: record.type,
          paymentMethod: record.paymentMethod,
          description: record.description,
          memo: record.memo,
          status: existingHashes.has(hash) ? "duplicate" : "insert",
        };

        transactions.push(preview);
      }

      console.log("[DEBUG] Preview generation completed:", {
        duration: Date.now() - previewStart,
        totalTransactions: transactions.length,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[ERROR] CSV processing error:", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        duration: Date.now() - startTime,
      });
      errors.push(`CSV解析エラー: ${errorMessage}`);
    }

    // Calculate summary
    const summaryStart = Date.now();
    const summary = {
      totalCount: transactions.length,
      insertCount: transactions.filter((t) => t.status === "insert").length,
      updateCount: transactions.filter((t) => t.status === "update").length,
      duplicateCount: transactions.filter((t) => t.status === "duplicate")
        .length,
      errorCount: transactions.filter((t) => t.status === "error").length,
    };

    console.log("[DEBUG] Usecase execution completed:", {
      summaryCalculation: Date.now() - summaryStart,
      totalDuration: Date.now() - startTime,
      summary,
      errorCount: errors.length,
    });

    return {
      transactions,
      summary,
      errors,
    };
  }
}
