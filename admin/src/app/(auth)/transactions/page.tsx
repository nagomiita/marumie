import "server-only";

import { TransactionsClient } from "@/client/components/transactions/TransactionsClient";
import { loadPersonalTransactions } from "@/server/loaders/load-personal-transactions";

export default async function TransactionsPage() {
  const loadTransactions = async () => {
    "use server";
    return await loadPersonalTransactions();
  };

  return (
    <div className="bg-primary-panel rounded-xl p-4">
      <h1 className="text-2xl font-bold text-white mb-6">取引一覧</h1>
      <TransactionsClient loadTransactions={loadTransactions} />
    </div>
  );
}
