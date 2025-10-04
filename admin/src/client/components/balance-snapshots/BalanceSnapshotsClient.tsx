"use client";

import { useEffect, useState } from "react";
import type { BalanceSnapshot } from "@/shared/models/balance-snapshot";

interface BalanceSnapshotsClientProps {
  loadBalanceSnapshots: () => Promise<BalanceSnapshot[]>;
  createBalanceSnapshot?: (data: {
    organizationId: string;
    balance: number;
    snapshotDate: Date;
  }) => Promise<{ ok: boolean; message: string }>;
}

export default function BalanceSnapshotsClient({
  loadBalanceSnapshots,
  createBalanceSnapshot,
}: BalanceSnapshotsClientProps) {
  const [snapshots, setSnapshots] = useState<BalanceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [snapshotDate, setSnapshotDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        setLoading(true);
        const data = await loadBalanceSnapshots();
        setSnapshots(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "データの読み込みに失敗しました",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, [loadBalanceSnapshots]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createBalanceSnapshot || !newBalance || !snapshotDate) return;

    try {
      setCreating(true);
      const result = await createBalanceSnapshot({
        organizationId: "", // TODO: Organization selection
        balance: parseFloat(newBalance),
        snapshotDate: new Date(snapshotDate),
      });

      if (result.ok) {
        // Refresh the list
        const data = await loadBalanceSnapshots();
        setSnapshots(data);
        setNewBalance("");
        setSnapshotDate(new Date().toISOString().split("T")[0]);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "残高の登録に失敗しました");
    } finally {
      setCreating(false);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ja-JP");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };

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

  return (
    <div className="space-y-6">
      {/* Create new balance snapshot form */}
      {createBalanceSnapshot && (
        <div className="bg-gray-800 rounded border border-gray-700 p-4">
          <h3 className="text-white font-semibold mb-4">新しい残高を登録</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  登録日
                </label>
                <input
                  type="date"
                  value={snapshotDate}
                  onChange={(e) => setSnapshotDate(e.target.value)}
                  className="bg-primary-input text-white border border-primary-border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  残高（円）
                </label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="1000000"
                  className="bg-primary-input text-white border border-primary-border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-accent"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating || !newBalance || !snapshotDate}
              className="bg-primary-accent text-white border-0 rounded-lg px-4 py-2 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "登録中..." : "残高を登録"}
            </button>
          </form>
        </div>
      )}

      {/* Balance snapshots list */}
      <div className="bg-gray-800 rounded border border-gray-700 p-4">
        <h3 className="text-white font-semibold mb-4">
          残高履歴 ({snapshots.length}件)
        </h3>

        {snapshots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">残高データがありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-300">登録日</th>
                  <th className="px-3 py-2 text-left text-gray-300">残高</th>
                  <th className="px-3 py-2 text-left text-gray-300">
                    更新日時
                  </th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => (
                  <tr
                    key={snapshot.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <td className="px-3 py-2 text-gray-300">
                      {formatDate(snapshot.snapshot_date)}
                    </td>
                    <td className="px-3 py-2 text-gray-300 text-right font-mono">
                      ¥{formatAmount(snapshot.balance)}
                    </td>
                    <td className="px-3 py-2 text-gray-300">
                      {formatDate(snapshot.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
