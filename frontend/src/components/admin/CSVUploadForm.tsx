import { useState } from "react";
import type { OrganizationRead } from "@/client/api/generated/model";

interface CSVUploadFormProps {
  organizations: OrganizationRead[];
  selectedOrgId: string;
  onOrgChange: (orgId: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  uploading: boolean;
  file: File | null;
  result: {
    success: boolean;
    message: string;
    details?: unknown;
  } | null;
}

export default function CSVUploadForm({
  organizations,
  selectedOrgId,
  onOrgChange,
  onFileChange,
  onSubmit,
  uploading,
  file,
  result,
}: CSVUploadFormProps) {
  const [localFile, setLocalFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setLocalFile(selectedFile);
    onFileChange(selectedFile);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="organization"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            組織を選択
          </label>
          <select
            id="organization"
            value={selectedOrgId}
            onChange={(e) => onOrgChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {organizations.length === 0 ? (
              <option value="">組織がありません</option>
            ) : (
              organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.display_name || org.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="csv-file"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            CSVファイルを選択
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              選択されたファイル: <strong>{file.name}</strong> (
              {(file.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading || !selectedOrgId}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? "アップロード中..." : "アップロード"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-6 p-4 rounded-md ${
            result.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              result.success ? "text-green-800" : "text-red-800"
            }`}
          >
            {result.message}
          </p>
          {result.details !== undefined && (
            <pre className="mt-2 text-xs text-gray-600 overflow-auto">
              {JSON.stringify(
                result.details as Record<string, unknown>,
                null,
                2,
              )}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
