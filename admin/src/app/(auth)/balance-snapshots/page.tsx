import "server-only";

import BalanceSnapshotsClient from "@/client/components/balance-snapshots/BalanceSnapshotsClient";
import { loadBalanceSnapshots } from "@/server/loaders/load-balance-snapshots";

export default async function BalanceSnapshotsPage() {
  const loadSnapshots = async () => {
    "use server";
    return await loadBalanceSnapshots();
  };

  return (
    <div className="bg-primary-panel rounded-xl p-4">
      <h1 className="text-2xl font-bold text-white mb-6">残高登録</h1>
      <BalanceSnapshotsClient loadBalanceSnapshots={loadSnapshots} />
    </div>
  );
}
