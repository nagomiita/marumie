import { useState, useEffect, useMemo } from "react";
import { useListOrganizations } from "@/client/api/generated/organizations/organizations";
import { useListTransactions } from "@/client/api/generated/transactions/transactions";
import type { TransactionRead } from "@/client/api/generated/model";
import DataTable, { type Column } from "@/components/common/DataTable";
import Selector, { type SelectorOption } from "@/components/common/Selector";
import Button from "@/components/common/Button";

export default function TransactionsPage() {
  const { data: organizationsData } = useListOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const { data: transactionsData, isLoading: loading } = useListTransactions(
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

  const transactions = Array.isArray(transactionsData?.data)
    ? transactionsData.data
    : [];

  // カテゴリとサブカテゴリのユニーク値を抽出
  const uniqueCategories = useMemo(
    () => Array.from(new Set(transactions.map((tx) => tx.category))).sort(),
    [transactions],
  );

  const uniqueSubcategories = useMemo(
    () =>
      Array.from(
        new Set(
          transactions.map((tx) => tx.subcategory).filter((s) => s != null),
        ),
      ).sort(),
    [transactions],
  );

  // 組織セレクターのオプション
  const organizationOptions: SelectorOption<string>[] = useMemo(
    () =>
      Array.isArray(organizationsData?.data)
        ? organizationsData.data.map((org) => ({
            value: org.id,
            label: org.display_name,
          }))
        : [],
    [organizationsData],
  );

  const columns: Column<TransactionRead>[] = [
    {
      key: "date",
      label: "日付",
      sortable: true,
      className: "whitespace-nowrap",
      render: (tx) => new Date(tx.date).toLocaleDateString("ja-JP"),
    },
    {
      key: "type",
      label: "区分",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: ["収入", "支出", "振替"],
      className: "whitespace-nowrap",
      render: (tx) => (
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
      ),
    },
    {
      key: "category",
      label: "カテゴリ",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: uniqueCategories,
      className: "whitespace-nowrap",
    },
    {
      key: "subcategory",
      label: "サブカテゴリ",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: uniqueSubcategories,
      className: "whitespace-nowrap",
      render: (tx) => tx.subcategory || "-",
    },
    {
      key: "amount",
      label: "金額",
      sortable: true,
      className: "text-right whitespace-nowrap",
      render: (tx) => formatAmount(Number(tx.amount)),
    },
    {
      key: "payment_method",
      label: "支払方法",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: Array.from(
        new Set(transactions.map((tx) => tx.payment_method)),
      ).sort(),
      className: "whitespace-nowrap",
    },
    {
      key: "description",
      label: "摘要",
      filterable: true,
      filterType: "text",
      className: "max-w-xs truncate",
      render: (tx) => tx.description,
    },
    {
      key: "actions",
      label: "操作",
      className: "text-right",
      render: (tx) => (
        <Button onClick={() => handleDelete(tx.id)} variant="danger" size="sm">
          削除
        </Button>
      ),
    },
  ];

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
        <Selector
          id="org-filter"
          label="組織で絞り込み"
          value={selectedOrgId}
          options={organizationOptions}
          onChange={setSelectedOrgId}
          className="flex-col items-start gap-2"
          labelClassName="text-sm font-medium text-gray-700"
          selectClassName="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <DataTable
        data={transactions}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        pageSize={50}
      />
    </div>
  );
}
