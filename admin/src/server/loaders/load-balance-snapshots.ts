import "server-only";

import { prisma } from "@/server/lib/prisma";
import type { BalanceSnapshot } from "@/shared/models/balance-snapshot";

export interface LoadBalanceSnapshotsOptions {
  politicalOrganizationId?: string;
  limit?: number;
  offset?: number;
}

export async function loadBalanceSnapshots(
  options: LoadBalanceSnapshotsOptions = {},
): Promise<BalanceSnapshot[]> {
  try {
    const where: any = {};

    if (options.politicalOrganizationId) {
      where.politicalOrganizationId = BigInt(options.politicalOrganizationId);
    }

    const snapshots = await prisma.balanceSnapshot.findMany({
      where,
      orderBy: [{ snapshotDate: "desc" }, { createdAt: "desc" }],
      take: options.limit || 100,
      skip: options.offset || 0,
    });

    return snapshots.map((snapshot) => ({
      id: String(snapshot.id),
      political_organization_id: String(snapshot.politicalOrganizationId),
      snapshot_date: snapshot.snapshotDate,
      balance: Number(snapshot.balance),
      created_at: snapshot.createdAt,
      updated_at: snapshot.updatedAt,
    }));
  } catch (error) {
    console.error("Error loading balance snapshots:", error);
    throw new Error("残高データの読み込みに失敗しました");
  } finally {
    await prisma.$disconnect();
  }
}
