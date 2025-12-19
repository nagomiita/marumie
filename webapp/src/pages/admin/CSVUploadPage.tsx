import { useState, useEffect } from "react";
import { useListOrganizationsOrganizationsGet } from "@/client/api/generated/organizations/organizations";
import { useUploadCsvCsvUploadPost } from "@/client/api/generated/csv/csv";

export default function CSVUploadPage() {
  const { data: organizationsData } = useListOrganizationsOrganizationsGet();
  const uploadMutation = useUploadCsvCsvUploadPost();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: unknown;
  } | null>(null);

  // 最初の組織を自動選択
  useEffect(() => {
    if (
      organizationsData?.data &&
      Array.isArray(organizationsData.data) &&
      organizationsData.data.length > 0 &&
      !selectedOrgId
    ) {
      setSelectedOrgId(organizationsData.data[0].id);
    }
  }, [organizationsData, selectedOrgId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (!selectedOrgId) {
      setResult({
        success: false,
        message: "組織を選択してください",
      });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const response = await uploadMutation.mutateAsync({
        data: { file },
        params: { organization_id: selectedOrgId },
      });

      setResult({
        success: true,
        message:
          (response.data &&
          "message" in response.data &&
          typeof response.data.message === "string"
            ? response.data.message
            : undefined) || "アップロード成功",
        details: response.data,
      });
      setFile(null);

      // ファイル入力をリセット
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Error uploading CSV:", error);

      // エラーの詳細を取得
      let errorMessage = "CSVのアップロードに失敗しました";
      if (error?.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResult({
        success: false,
        message: errorMessage,
        details: error?.response
          ? await error.response.clone().text()
          : undefined,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">CSVアップロード</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            CSVフォーマット
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            以下のカラムを含むCSVファイルをアップロードしてください（日本語・英語どちらでも可）:
          </p>
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div>
              <strong className="text-sm">日本語ヘッダー:</strong>
              <code className="text-sm block mt-1">
                日付,カテゴリ,サブカテゴリ,金額,収支区分,支払方法,摘要,メモ
              </code>
            </div>
            <div>
              <strong className="text-sm">英語ヘッダー:</strong>
              <code className="text-sm block mt-1">
                organization_id, date, category_key, label, amount, type,
                friendly_category
              </code>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ※ ヘッダー行を必ず含めてください
            <br />※ 日付は YYYY/MM/DD または YYYY-MM-DD 形式で入力してください
            <br />※
            収支区分は「支出」「収入」「振替」のいずれかを指定してください
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
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
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {!organizationsData?.data ||
              !Array.isArray(organizationsData.data) ||
              organizationsData.data.length === 0 ? (
                <option value="">組織がありません</option>
              ) : (
                organizationsData.data.map((org) => (
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

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">⚠️ 注意事項</h3>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>CSVファイルは UTF-8 エンコーディングで保存してください</li>
          <li>日付は YYYY-MM-DD 形式で入力してください</li>
          <li>organization_id は既存の組織IDを指定してください</li>
          <li>
            type は income, expense, transfer のいずれかを指定してください
          </li>
          <li>amount は数値のみを入力してください（カンマ不要）</li>
        </ul>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">サンプルCSV</h3>
        <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
          <pre className="text-xs">
            {`organization_id,date,category_key,label,amount,type,friendly_category
123e4567-e89b-12d3-a456-426614174000,2025-01-15,salary,給与,300000,income,給与・賞与
123e4567-e89b-12d3-a456-426614174000,2025-01-20,rent,家賃,80000,expense,住居費
123e4567-e89b-12d3-a456-426614174000,2025-01-25,food,食費,15000,expense,食費`}
          </pre>
        </div>
        <button
          type="button"
          onClick={() => {
            const csvContent = `organization_id,date,category_key,label,amount,type,friendly_category
123e4567-e89b-12d3-a456-426614174000,2025-01-15,salary,給与,300000,income,給与・賞与
123e4567-e89b-12d3-a456-426614174000,2025-01-20,rent,家賃,80000,expense,住居費
123e4567-e89b-12d3-a456-426614174000,2025-01-25,food,食費,15000,expense,食費`;
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sample_transactions.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          サンプルCSVをダウンロード
        </button>
      </div>
    </div>
  );
}
