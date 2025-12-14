import "server-only";

import { prisma } from "@/server/lib/prisma";
import { withServerCache } from "@/server/utils/cache";
import type { OrganizationsResponse } from "../../types/organization";

export const loadOrganizations =
  withServerCache(async (): Promise<OrganizationsResponse> => {
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
  }, ["organizations"]);
