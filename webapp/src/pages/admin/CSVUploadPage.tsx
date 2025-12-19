import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function CSVUploadPage() {
  const { supabase } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: unknown;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      // CSVファイルを読み込み
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error("CSVファイルが空です");
      }

      // ヘッダー行を解析
      const headers = lines[0].split(",").map((h) => h.trim());

      // 必須カラムのチェック
      const requiredColumns = [
        "organization_id",
        "date",
        "category_key",
        "label",
        "amount",
        "type",
        "friendly_category",
      ];
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col),
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `必須カラムが不足しています: ${missingColumns.join(", ")}\n\n` +
            `検出されたカラム: ${headers.join(", ")}\n\n` +
            `このCSVファイルは異なるフォーマットのようです。正しいフォーマットのCSVファイルをアップロードしてください。`,
        );
      }

      // データ行を解析してトランザクションを作成
      const transactions = lines.slice(1).map((line, index) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string | number> = {};

        headers.forEach((header, idx) => {
          const value = values[idx] || "";
          // 数値フィールドを適切に変換
          if (header === "amount" && value) {
            row[header] = Number(value);
          } else {
            row[header] = value;
          }
        });

        // 必須フィールドのバリデーション
        if (!row.organization_id || !row.date || !row.amount) {
          throw new Error(
            `行 ${index + 2}: 必須フィールド（organization_id, date, amount）が不足しています`,
          );
        }

        return row;
      });

      // Supabaseにデータを挿入
      const { data, error } = await supabase
        .from("transactions")
        .insert(transactions);

      if (error) {
        throw new Error(
          `データベースエラー: ${error.message}\n\nヒント: organization_idが正しいか、日付フォーマットがYYYY-MM-DDになっているか確認してください。`,
        );
      }

      setResult({
        success: true,
        message: `${transactions.length}件のトランザクションをインポートしました`,
        details: data,
      });
      setFile(null);

      // ファイル入力をリセット
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "CSVのアップロードに失敗しました",
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
            以下のカラムを含むCSVファイルをアップロードしてください:
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <code className="text-sm">
              organization_id, date, category_key, label, amount, type,
              friendly_category
            </code>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ※ ヘッダー行を必ず含めてください
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
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
            disabled={!file || uploading}
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
