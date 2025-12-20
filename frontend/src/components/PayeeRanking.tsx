import { useMemo } from "react";
import type { TransactionRead } from "@/client/api/generated/model";

interface PayeeRankingProps {
  transactions: TransactionRead[];
  selectedMonth?: number;
  limit?: number;
}

interface PayeeStats {
  payee: string;
  totalAmount: number;
  count: number;
  category: string;
}

export default function PayeeRanking({
  transactions,
  selectedMonth,
  limit = 20,
}: PayeeRankingProps) {
  const payeeStats = useMemo(() => {
    // 支出のみをフィルタ
    let expenses = transactions.filter((tx) => tx.type === "expense");

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
        const stats = statsMap.get(payee)!;
        stats.totalAmount += amount;
        stats.count += 1;
      } else {
        statsMap.set(payee, {
          payee,
          totalAmount: amount,
          count: 1,
          category: tx.category,
        });
      }
    }

    // 金額の多い順にソート
    return Array.from(statsMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);
  }, [transactions, selectedMonth, limit]);

  const totalExpense = useMemo(() => {
    return payeeStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
  }, [payeeStats]);

  if (payeeStats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-3 md:p-4">
        <h3 className="text-base md:text-lg font-semibold mb-3">
          支払先ランキング
        </h3>
        <p className="text-gray-600">データが存在しません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold">支払先ランキング</h3>
        <span className="text-sm text-gray-600">
          合計: {totalExpense.toLocaleString("ja-JP")}円
        </span>
      </div>

      <div className="space-y-2">
        {payeeStats.map((stat, index) => {
          const percentage = (stat.totalAmount / totalExpense) * 100;

          return (
            <div
              key={stat.payee}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
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
            </div>
          );
        })}
      </div>

      {payeeStats.length >= limit && (
        <p className="text-xs text-gray-500 text-center">
          上位{limit}件を表示しています
        </p>
      )}
    </div>
  );
}
