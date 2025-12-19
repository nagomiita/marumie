import { useState, useEffect } from "react";
import { useListOrganizationsOrganizationsGet } from "@/client/api/generated/organizations/organizations";
import { useListPersonalTransactionsPersonalTransactionsGet } from "@/client/api/generated/personal-transactions/personal-transactions";

export default function TransactionsPage() {
  const { data: organizationsData } = useListOrganizationsOrganizationsGet();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const { data: transactionsData, isLoading: loading } =
    useListPersonalTransactionsPersonalTransactionsGet(
      { organization_id: selectedOrgId || undefined },
      { query: { enabled: !!selectedOrgId } },
    );

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

  const handleDelete = async (id: string) => {
    // TODO: delete APIが実装されたら追加
    console.log("Delete transaction:", id);
    alert("削除機能は未実装です");
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      expense: "支出",
      income: "収入",
      transfer: "振替",
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div>読込中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          トランザクション一覧
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <label
          htmlFor="org-filter"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          組織で絞り込み
        </label>
        <select
          id="org-filter"
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Array.isArray(organizationsData?.data) &&
            organizationsData.data.map((org) => (
              <option key={org.id} value={org.id}>
                {org.display_name}
              </option>
            ))}
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {Array.isArray(transactionsData?.data)
              ? transactionsData.data.length
              : 0}
            件のトランザクション
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  区分
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  サブカテゴリ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支払方法
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  摘要
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(transactionsData?.data) &&
                transactionsData.data.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.date).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.type === "income"
                            ? "bg-green-100 text-green-800"
                            : tx.type === "expense"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.subcategory || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatAmount(Number(tx.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.payment_method}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleDelete(tx.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
