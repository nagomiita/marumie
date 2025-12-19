import { useMemo, useState } from "react";
import type { PersonalTransactionRead } from "@/client/api/generated/model";

interface TransactionsTableProps {
  transactions: PersonalTransactionRead[];
  selectedMonth?: number;
}

const PAGE_SIZE = 25;

export default function TransactionsTable({
  transactions,
  selectedMonth,
}: TransactionsTableProps) {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

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

    return result;
  }, [transactions, selectedMonth, typeFilter, categoryFilter, searchText]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // フィルタ変更時にページをリセット
  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          取引一覧 ({filtered.length}件)
        </h3>
        <div className="flex gap-2 items-center text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            前へ
          </button>
          <span>
            {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
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
                <th className="py-2 pr-4">日付</th>
                <th className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 whitespace-nowrap">
                      種別
                    </span>
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
                    <span className="text-gray-600 whitespace-nowrap">
                      カテゴリ
                    </span>
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
                <th className="py-2 pr-4">金額</th>
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
                    <td className="py-2 pr-4 whitespace-nowrap">{tx.type}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {tx.category}
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
