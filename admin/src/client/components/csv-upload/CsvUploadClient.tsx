"use client";
import "client-only";

import { useId, useState, useCallback } from "react";
import PersonalCsvPreview from "@/client/components/csv-import/PersonalCsvPreview";
import type { UploadPersonalCsvResponse } from "@/server/actions/upload-personal-csv";
import type { Organization } from "@/shared/models/organization";
import type { PreviewPersonalCsvResult } from "@/server/usecases/preview-personal-csv-usecase";
import type { PersonalTransactionPreview } from "@/shared/models/personal-transaction";

interface CsvUploadClientProps {
  organizations: Organization[];
}

export default function CsvUploadClient({
  organizations,
}: CsvUploadClientProps) {
  const csvFileInputId = useId();
  const organizationSelectId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [personalPreviewResult, setPersonalPreviewResult] =
    useState<PreviewPersonalCsvResult | null>(null);

  const handlePersonalPreviewComplete = useCallback(
    (result: PreviewPersonalCsvResult) => {
      setPersonalPreviewResult(result);
    },
    [],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");
    setErrors([]);
    setHasError(false);

    try {
      // Handle personal transaction CSV
      if (!personalPreviewResult) {
        setMessage("Preview data not available");
        setHasError(true);
        return;
      }

      const validTransactions = personalPreviewResult.transactions.filter(
        (t) => t.status === "insert" || t.status === "update",
      );
      if (validTransactions.length === 0) {
        setMessage("保存可能なデータがありません");
        setHasError(true);
        return;
      }

      const response = await fetch("/api/upload-personal-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          validTransactions,
          organizationId: selectedOrganizationId || undefined,
        }),
      });

      const payload = (await response.json()) as UploadPersonalCsvResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            payload.message ||
            "CSVデータの保存中にエラーが発生しました",
        );
      }

      const result = payload as UploadPersonalCsvResponse;

      if (!result.ok && result.errors && result.errors.length > 0) {
        setMessage(result.message);
        setErrors(result.errors);
        setHasError(true);
        return;
      }

      setMessage(
        result.message ||
          `Successfully processed ${result.processedCount} records and saved ${result.savedCount} transactions`,
      );

      setPersonalPreviewResult(null);

      setFile(null);
      const fileInput = document.getElementById(
        csvFileInputId,
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setHasError(true);
      // For admin interface, show stack trace
      if (err instanceof Error && err.stack) {
        setErrors([err.stack]);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label
          htmlFor={csvFileInputId}
          className="block text-sm font-medium text-white mb-2"
        >
          CSV File:
        </label>
        <input
          id={csvFileInputId}
          className="bg-primary-input text-white border border-primary-border rounded-lg px-3 py-2.5 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-accent file:text-white hover:file:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </div>

      <div>
        <label
          htmlFor={organizationSelectId}
          className="block text-sm font-medium text-white mb-2"
        >
          組織を選択:
        </label>
        <select
          id={organizationSelectId}
          value={selectedOrganizationId}
          onChange={(e) => setSelectedOrganizationId(e.target.value)}
          className="bg-primary-input text-white border border-primary-border rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-primary-accent"
          required
        >
          <option value="">組織を選択してください</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.displayName || org.name} ({org.type})
            </option>
          ))}
        </select>
      </div>

      <PersonalCsvPreview
        file={file}
        organizationId={selectedOrganizationId}
        onPreviewComplete={handlePersonalPreviewComplete}
      />

      <button
        disabled={
          !file ||
          !selectedOrganizationId ||
          uploading ||
          !personalPreviewResult ||
          personalPreviewResult.summary.insertCount +
            personalPreviewResult.summary.updateCount ===
            0
        }
        type="submit"
        className={`bg-primary-accent text-white border-0 rounded-lg px-4 py-2.5 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-accent ${
          !file ||
          !selectedOrganizationId ||
          uploading ||
          !personalPreviewResult ||
          personalPreviewResult.summary.insertCount +
            personalPreviewResult.summary.updateCount ===
            0
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-600 cursor-pointer"
        }`}
      >
        {uploading ? "Processing…" : "このデータを保存する"}
      </button>

      {message && (
        <div
          className={`mt-3 p-3 rounded border ${
            hasError
              ? "text-red-500 bg-red-900/20 border-red-900/30"
              : "text-green-500 bg-green-900/20 border-green-900/30"
          }`}
        >
          {message}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-3 p-3 rounded border text-red-500 bg-red-900/20 border-red-900/30">
          <div className="font-semibold mb-2">エラー詳細:</div>
          {errors.map((error) => (
            <div key={error} className="mb-2 last:mb-0">
              <pre className="whitespace-pre-wrap text-xs font-mono bg-red-950/30 p-2 rounded overflow-x-auto">
                {error}
              </pre>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
