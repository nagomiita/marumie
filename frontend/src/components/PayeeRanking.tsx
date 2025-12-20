import { useMemo, useState } from "react";
import Card from "@/components/common/Card";
import Modal from "@/components/common/Modal";
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
  transactions: TransactionRead[];
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
  }, [transactions, selectedMonth, limit]);

  const totalExpense = useMemo(() => {
    return payeeStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
  }, [payeeStats]);

  const [selected, setSelected] = useState<PayeeStats | null>(null);

  if (payeeStats.length === 0) {
    return (
      <Card title="支払先ランキング">
        <p className="text-gray-600">データが存在しません</p>
      </Card>
    );
  }

  return (
    <Card title="支払先ランキング" className="space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          合計: {totalExpense.toLocaleString("ja-JP")}円
        </span>
      </div>

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
