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

  const filtered = useMemo(() => {
    if (!selectedMonth) return transactions;
    return transactions.filter(
      (tx) => new Date(tx.date).getMonth() + 1 === selectedMonth,
    );
  }, [transactions, selectedMonth]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
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
                <th className="py-2 pr-4">種別</th>
                <th className="py-2 pr-4">カテゴリ</th>
                <th className="py-2 pr-4">金額</th>
                <th className="py-2 pr-4">摘要</th>
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
