import { useMemo, useState } from "react";
import Card from "@/components/common/Card";
import Modal from "@/components/common/Modal";
import type {
  TransactionRead,
  CategoryRead,
} from "@/client/api/generated/model";

interface PayeeRankingProps {
  transactions: TransactionRead[];
  categories?: CategoryRead[];
  selectedMonth?: number;
  limit?: number;
}

interface PayeeStats {
  payee: string;
  totalAmount: number;
  count: number;
  category: string;
  transactions: TransactionRead[];
}

export default function PayeeRanking({
  transactions,
  categories = [],
  selectedMonth,
  limit: initialLimit = 10,
}: PayeeRankingProps) {
  const [limit, setLimit] = useState(initialLimit);

  // デフォルトで全カテゴリを選択（投資カテゴリのみ除外）
  const defaultSelectedCategories = useMemo(() => {
    return categories.map((cat) => cat.name);
  }, [categories]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    defaultSelectedCategories,
  );

  // selectedCategoriesのデフォルト値が変わったら更新
  useMemo(() => {
    setSelectedCategories(defaultSelectedCategories);
  }, [defaultSelectedCategories]);

  const payeeStats = useMemo(() => {
    // 支出のみをフィルタ
    let expenses = transactions.filter((tx) => tx.type === "expense");

    // 選択されたカテゴリのみに絞り込み（カテゴリ名で比較）
    if (selectedCategories.length > 0) {
      expenses = expenses.filter((tx) =>
        selectedCategories.includes(tx.category),
      );
    }

    // 月フィルタ
    if (selectedMonth) {
      expenses = expenses.filter(
        (tx) => new Date(tx.date).getMonth() + 1 === selectedMonth,
      );
    }

    // 支払先別に集計
    const statsMap = new Map<string, PayeeStats>();

    for (const tx of expenses) {
      const payee = tx.description || "(摘要なし)";
      const amount = Math.abs(Number(tx.amount));

      if (statsMap.has(payee)) {
        const stats = statsMap.get(payee);
        if (stats) {
          stats.totalAmount += amount;
          stats.count += 1;
          stats.transactions.push(tx);
        }
      } else {
        statsMap.set(payee, {
          payee,
          totalAmount: amount,
          count: 1,
          category: tx.category,
          transactions: [tx],
        });
      }
    }

    // 金額の多い順にソート
    return Array.from(statsMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);
  }, [transactions, selectedMonth, limit, selectedCategories]);

  const totalExpense = useMemo(() => {
    return payeeStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
  }, [payeeStats]);

  const [selected, setSelected] = useState<PayeeStats | null>(null);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName],
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
  };

  const handleSelectAll = () => {
    setSelectedCategories(categories.map((cat) => cat.name));
  };

  return (
    <Card title="支払先ランキング" className="space-y-3 md:space-y-4">
      {/* カテゴリ選択セレクター */}
      {categories.length > 0 && (
        <div className="border-b border-gray-200 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">
              表示するカテゴリ
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-1 text-xs text-teal-600 hover:text-teal-800 hover:underline"
              >
                全選択
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:underline"
              >
                全解除
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.name)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedCategories.includes(category.name)
                    ? "bg-teal-100 border-teal-400 text-teal-800"
                    : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {selectedCategories.includes(category.name) ? "✓ " : ""}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {payeeStats.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            合計: {totalExpense.toLocaleString("ja-JP")}円
          </span>
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="text-xs text-gray-600">
              表示件数:
            </label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value={5}>5件</option>
              <option value={10}>10件</option>
              <option value={20}>20件</option>
              <option value={50}>50件</option>
              <option value={100}>100件</option>
            </select>
          </div>
        </div>
      )}

      {payeeStats.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          選択されたカテゴリにデータが存在しません
        </p>
      ) : (
        <div className="space-y-2">
          {payeeStats.map((stat, index) => {
            const percentage = (stat.totalAmount / totalExpense) * 100;

            return (
              <button
                key={stat.payee}
                className="w-full text-left border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
                onClick={() => setSelected(stat)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg font-bold text-gray-400 shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">
                        {stat.payee}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stat.category} · {stat.count}件
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm md:text-base text-red-600">
                      {stat.totalAmount.toLocaleString("ja-JP")}円
                    </p>
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* プログレスバー */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {payeeStats.length >= limit && (
        <p className="text-xs text-gray-500 text-center">
          上位{limit}件を表示しています
        </p>
      )}

      {/* 詳細モーダル */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <h4 className="text-lg font-bold mb-2">{selected.payee}</h4>
            <div className="mb-2 text-sm text-gray-600">
              カテゴリ: {selected.category} / 件数: {selected.count} / 合計:{" "}
              {selected.totalAmount.toLocaleString("ja-JP")}円
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {selected.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="border rounded p-2 text-xs flex flex-col gap-1 bg-gray-50"
                >
                  <div className="flex justify-between">
                    <span>{new Date(tx.date).toLocaleDateString("ja-JP")}</span>
                    <span
                      className={
                        tx.type === "expense"
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {tx.type === "expense" ? "-" : "+"}
                      {Number(tx.amount).toLocaleString()}円
                    </span>
                  </div>
                  <div className="text-gray-500">{tx.category}</div>
                  {tx.description && <div>{tx.description}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </Card>
  );
}
