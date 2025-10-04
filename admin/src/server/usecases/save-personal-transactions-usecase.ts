import { PersonalTransactionHash } from "@/server/lib/personal-transaction-hash";
import type { PersonalTransactionRepository } from "@/server/repositories/interfaces/personal-transaction-repository.interface";
import type { PersonalTransactionPreview } from "@/shared/models/personal-transaction";

export interface SavePersonalTransactionsRequest {
  validTransactions: PersonalTransactionPreview[];
  organizationId?: string;
}

export interface SavePersonalTransactionsResult {
  ok: boolean;
  message: string;
  processedCount: number;
  savedCount: number;
  errors?: string[];
}

export class SavePersonalTransactionsUsecase {
  constructor(
    private readonly personalTransactionRepository: PersonalTransactionRepository,
  ) {}

  async execute(
    request: SavePersonalTransactionsRequest,
  ): Promise<SavePersonalTransactionsResult> {
    const { validTransactions, organizationId } = request;

    if (validTransactions.length === 0) {
      return {
        ok: false,
        message: "保存可能なトランザクションがありません",
        processedCount: 0,
        savedCount: 0,
      };
    }

    try {
      // Filter transactions that can be inserted (not duplicates or errors)
      const insertableTransactions = validTransactions.filter(
        (t) => t.status === "insert" || t.status === "update",
      );

      if (insertableTransactions.length === 0) {
        return {
          ok: false,
          message: "新規保存可能なトランザクションがありません",
          processedCount: validTransactions.length,
          savedCount: 0,
        };
      }

      // Convert to repository format
      const transactionsToSave = insertableTransactions.map((transaction) => {
        // Parse date from string format
        const date = new Date(transaction.date);

        // Generate hash for duplicate detection
        const csvData = {
          date,
          category: transaction.category,
          subcategory: transaction.subcategory,
          amount: transaction.amount,
          type: transaction.type,
          paymentMethod: transaction.paymentMethod,
          description: transaction.description,
          memo: transaction.memo,
        };
        const hash = PersonalTransactionHash.generate(csvData, organizationId);

        return {
          organizationId,
          date,
          category: transaction.category,
          subcategory: transaction.subcategory,
          amount: transaction.amount,
          type: transaction.type,
          paymentMethod: transaction.paymentMethod,
          description: transaction.description,
          memo: transaction.memo,
          hash,
        };
      });

      // Save transactions to database
      const savedCount =
        await this.personalTransactionRepository.createMany(transactionsToSave);

      return {
        ok: true,
        message: `${savedCount}件のトランザクションを保存しました`,
        processedCount: validTransactions.length,
        savedCount,
      };
    } catch (error) {
      console.error("Save personal transactions error:", error);

      return {
        ok: false,
        message: "トランザクションの保存中にエラーが発生しました",
        processedCount: validTransactions.length,
        savedCount: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}
