import { useMemo, useState } from "react";
import type { PersonalTransactionRead } from "@/client/api/generated/model";

interface TransactionsTableProps {
  transactions: PersonalTransactionRead[];
  selectedMonth?: number;
}

const PAGE_SIZE = 25;

// カテゴリ名から一貫した色を生成する関数
const getCategoryColor = (category: string): string => {
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-green-100 text-green-800 border-green-200",
    "bg-yellow-100 text-yellow-800 border-yellow-200",
    "bg-red-100 text-red-800 border-red-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
    "bg-orange-100 text-orange-800 border-orange-200",
    "bg-teal-100 text-teal-800 border-teal-200",
    "bg-cyan-100 text-cyan-800 border-cyan-200",
    "bg-lime-100 text-lime-800 border-lime-200",
    "bg-emerald-100 text-emerald-800 border-emerald-200",
    "bg-sky-100 text-sky-800 border-sky-200",
    "bg-violet-100 text-violet-800 border-violet-200",
    "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    "bg-rose-100 text-rose-800 border-rose-200",
    "bg-amber-100 text-amber-800 border-amber-200",
    "bg-slate-100 text-slate-800 border-slate-200",
    "bg-zinc-100 text-zinc-800 border-zinc-200",
    "bg-stone-100 text-stone-800 border-stone-200",
  ];

  // カテゴリ名から一貫したハッシュ値を生成
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export default function TransactionsTable({
  transactions,
  selectedMonth,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h3 className="text-base md:text-lg font-semibold">
          取引一覧 ({filtered.length}件)
        </h3>
        <div className="flex gap-2 items-center text-xs md:text-sm">
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
      </div>

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
              {pageItems.map((tx: PersonalTransactionRead) => {
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
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-md border ${getCategoryColor(tx.category)}`}
                      >
                        {tx.category}
                      </span>
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
    </div>
  );
}
