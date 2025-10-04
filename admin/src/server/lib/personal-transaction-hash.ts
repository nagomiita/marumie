import { createHash } from "crypto";
import type { PersonalCsvData } from "./personal-csv-loader";

/**
 * Personal transaction hash generator for duplicate detection
 */
export class PersonalTransactionHash {
  /**
   * Generate a hash for a personal transaction record
   */
  static generate(data: PersonalCsvData, organizationId?: string): string {
    // Include organizationId if provided for organization-specific deduplication
    const hashInput = [
      organizationId || "",
      data.date.toISOString().split("T")[0], // YYYY-MM-DD format
      data.category,
      data.subcategory || "",
      data.amount.toString(),
      data.type,
      data.paymentMethod,
      data.description,
    ].join("|");

    return createHash("sha256").update(hashInput, "utf-8").digest("hex");
  }

  /**
   * Generate hashes for multiple records
   */
  static generateMany(
    records: PersonalCsvData[],
    organizationId?: string,
  ): string[] {
    return records.map((record) =>
      PersonalTransactionHash.generate(record, organizationId),
    );
  }
}
