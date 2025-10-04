"use client";

import { useEffect, useState } from "react";
import type { PersonalTransaction } from "@/shared/models/personal-transaction";

interface TransactionsClientProps {
  loadTransactions: () => Promise<PersonalTransaction[]>;
}

export function TransactionsClient({
  loadTransactions,
}: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await loadTransactions();
        setTransactions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "データの読み込みに失敗しました",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [loadTransactions]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">エラー: {error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">取引データがありません</p>
        <p className="text-gray-500 text-sm mt-2">
          CSVアップロードから取引データを追加してください
        </p>
      </div>
    );
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ja-JP");
  };

  const getTypeLabel = (type: string) => {
    return type === "income" ? "収入" : "支出";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded border border-gray-700 p-4">
        <h3 className="text-white font-semibold mb-3">
          取引一覧 ({transactions.length}件)
        </h3>
      </div>

      <div className="bg-gray-800 rounded border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-gray-300">日付</th>
                <th className="px-3 py-2 text-left text-gray-300">カテゴリ</th>
                <th className="px-3 py-2 text-left text-gray-300">金額</th>
                <th className="px-3 py-2 text-left text-gray-300">区分</th>
                <th className="px-3 py-2 text-left text-gray-300">支払方法</th>
                <th className="px-3 py-2 text-left text-gray-300">摘要</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-700 hover:bg-gray-750"
                >
                  <td className="px-3 py-2 text-gray-300">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-3 py-2 text-gray-300">
                    {transaction.category}
                    {transaction.subcategory && (
                      <div className="text-xs text-gray-400">
                        {transaction.subcategory}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-300 text-right font-mono">
                    ¥{formatAmount(transaction.amount)}
                  </td>
                  <td className="px-3 py-2 text-gray-300">
                    {getTypeLabel(transaction.type)}
                  </td>
                  <td className="px-3 py-2 text-gray-300">
                    {transaction.payment_method}
                  </td>
                  <td
                    className="px-3 py-2 text-gray-300 max-w-xs truncate"
                    title={transaction.description}
                  >
                    {transaction.description}
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
