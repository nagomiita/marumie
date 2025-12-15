import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/server/lib/prisma";
import type { OrganizationsResponse } from "../../types/organization";

const CACHE_REVALIDATE_SECONDS =
  process.env.NODE_ENV === "development" ? 0 : 3600;

export const loadOrganizations = unstable_cache(
  async (): Promise<OrganizationsResponse> => {
    // 全ての有効な組織データを取得
    const organizations = await prisma.organization.findMany({
      select: {
        slug: true,
        name: true,
        displayName: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (organizations.length === 0) {
      throw new Error("No organizations found");
    }

    return {
      default: organizations[0].slug,
      organizations: organizations.map((org) => ({
        slug: org.slug,
        orgName: org.name,
        displayName: org.displayName,
      })),
    };
  },
  ["organizations"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS, // 1時間キャッシュ（開発では0）
    tags: ["organizations"],
  },
);
