export default function CSVFormatGuide() {
  return (
    <>
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
    </>
  );
}
