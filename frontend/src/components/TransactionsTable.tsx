import { useMemo, useState } from "react";
import type { TransactionRead } from "@/client/api/generated/model";

interface TransactionsTableProps {
  transactions: TransactionRead[];
  selectedMonth?: number;
  categoryColorMap?: Map<string, string>;
}

const PAGE_SIZE = 25;

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
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<
    "date" | "type" | "category" | "amount" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // 利用可能なカテゴリを抽出
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.category) {
        categories.add(tx.category);
      }
    });
    return Array.from(categories).sort();
  }, [transactions]);

  const handleSort = (column: "date" | "type" | "category" | "amount") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = transactions;

    // 月フィルタ
    if (selectedMonth) {
      result = result.filter(
        (tx) => new Date(tx.date).getMonth() + 1 === selectedMonth,
      );
    }

    // 種別フィルタ
    if (typeFilter !== "all") {
      result = result.filter((tx) => tx.type === typeFilter);
    }

    // カテゴリフィルタ
    if (categoryFilter !== "all") {
      result = result.filter((tx) => tx.category === categoryFilter);
    }

    // テキスト検索
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(search) ||
          tx.category?.toLowerCase().includes(search),
      );
    }

    // ソート
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let comparison = 0;

        switch (sortColumn) {
          case "date":
            comparison =
              new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case "type":
            comparison = a.type.localeCompare(b.type);
            break;
          case "category":
            comparison = a.category.localeCompare(b.category);
            break;
          case "amount": {
            // 支出は負の値、収入は正の値として比較
            const aAmount =
              a.type === "expense" ? -Number(a.amount) : Number(a.amount);
            const bAmount =
              b.type === "expense" ? -Number(b.amount) : Number(b.amount);
            comparison = aAmount - bAmount;
            break;
          }
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [
    transactions,
    selectedMonth,
    typeFilter,
    categoryFilter,
    searchText,
    sortColumn,
    sortDirection,
  ]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // フィルタ変更時にページをリセット
  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 space-y-3 md:space-y-4">
      <h3 className="text-base md:text-lg font-semibold">
        取引一覧 ({filtered.length}件)
      </h3>

      {pageItems.length === 0 ? (
        <p className="text-gray-600">データが存在しません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 pr-4">
                  <button
                    type="button"
                    onClick={() => handleSort("date")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    日付
                    {sortColumn === "date" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSort("type")}
                      className="flex items-center gap-1 hover:text-gray-900 whitespace-nowrap"
                    >
                      種別
                      {sortColumn === "type" && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                    <select
                      value={typeFilter}
                      onChange={(e) => {
                        setTypeFilter(e.target.value);
                        handleFilterChange();
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                    >
                      <option value="all">すべて</option>
                      <option value="income">収入</option>
                      <option value="expense">支出</option>
                    </select>
                  </div>
                </th>
                <th className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSort("category")}
                      className="flex items-center gap-1 hover:text-gray-900 whitespace-nowrap"
                    >
                      カテゴリ
                      {sortColumn === "category" && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        handleFilterChange();
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                    >
                      <option value="all">すべて</option>
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="py-2 pr-4">
                  <button
                    type="button"
                    onClick={() => handleSort("amount")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    金額
                    {sortColumn === "amount" && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 whitespace-nowrap">
                      摘要
                    </span>
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        handleFilterChange();
                      }}
                      placeholder="検索..."
                      className="px-2 py-1 text-xs border border-gray-300 rounded w-32"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((tx: TransactionRead) => {
                const date = new Date(tx.date);
                const amount =
                  tx.type === "expense"
                    ? -Number(tx.amount)
                    : Number(tx.amount);
                return (
                  <tr key={tx.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {date.toLocaleDateString("ja-JP")}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          tx.type === "expense"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {tx.type === "expense" ? "支出" : "収入"}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {categoryColorMap?.has(tx.category) ? (
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
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right whitespace-nowrap">
                      {amount.toLocaleString("ja-JP")}
                    </td>
                    <td className="py-2 pr-4">{tx.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pageItems.length > 0 && (
        <div className="flex gap-2 items-center justify-center text-xs md:text-sm pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 text-xs md:text-sm rounded border border-gray-300 disabled:opacity-50"
          >
            前へ
          </button>
          <span className="text-xs md:text-sm">
            {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 text-xs md:text-sm rounded border border-gray-300 disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
