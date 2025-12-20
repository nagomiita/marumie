import { useMemo } from "react";
import type { TransactionRead } from "@/client/api/generated/model";
import DataTable, { type Column } from "@/components/common/DataTable";

interface TransactionsTableProps {
  transactions: TransactionRead[];
  selectedMonth?: number;
  categoryColorMap?: Map<string, string>;
}

// Hex色をRGBAに変換する関数
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function TransactionsTable({
  transactions,
  selectedMonth,
  categoryColorMap,
}: TransactionsTableProps) {
  // 月フィルタ適用済みのデータ
  const filteredByMonth = useMemo(() => {
    if (!selectedMonth) return transactions;
    return transactions.filter(
      (tx) => new Date(tx.date).getMonth() + 1 === selectedMonth,
    );
  }, [transactions, selectedMonth]);

  // 利用可能なカテゴリを抽出
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    filteredByMonth.forEach((tx) => {
      if (tx.category) {
        categories.add(tx.category);
      }
    });
    return Array.from(categories).sort();
  }, [filteredByMonth]);

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
      label: "種別",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: ["収入", "支出"],
      className: "whitespace-nowrap",
      render: (tx) => (
        <span
          className={`font-medium ${
            tx.type === "expense" ? "text-red-600" : "text-green-600"
          }`}
        >
          {tx.type === "expense" ? "支出" : "収入"}
        </span>
      ),
    },
    {
      key: "category",
      label: "カテゴリ",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: availableCategories,
      render: (tx) =>
        categoryColorMap?.has(tx.category) ? (
          <span
            className="inline-block px-2 py-1 text-xs font-medium rounded-md border text-gray-800"
            style={{
              backgroundColor: hexToRgba(
                categoryColorMap.get(tx.category)!,
                0.2,
              ),
              borderColor: categoryColorMap.get(tx.category),
            }}
          >
            {tx.category}
          </span>
        ) : (
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-md border bg-gray-100 text-gray-800 border-gray-300">
            {tx.category}
          </span>
        ),
    },
    {
      key: "amount",
      label: "金額",
      sortable: true,
      className: "text-right whitespace-nowrap",
      render: (tx) => {
        const amount =
          tx.type === "expense" ? -Number(tx.amount) : Number(tx.amount);
        return amount.toLocaleString("ja-JP");
      },
    },
    {
      key: "description",
      label: "摘要",
      filterable: true,
      filterType: "text",
      render: (tx) => tx.description,
    },
  ];

  return (
    <DataTable
      data={filteredByMonth}
      columns={columns}
      keyExtractor={(tx) => tx.id}
      pageSize={25}
      title="取引一覧"
    />
  );
}
