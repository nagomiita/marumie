import "server-only";

import { prisma } from "@/server/lib/prisma";
import type { Organization } from "@/shared/models/organization";

export interface LoadOrganizationsOptions {
  type?: string;
  userId?: string;
}

export async function loadOrganizations(
  options: LoadOrganizationsOptions = {},
): Promise<Organization[]> {
  try {
    const where: any = {};

    if (options.type) {
      where.type = options.type;
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    const organizations = await prisma.organization.findMany({
      where,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      displayName: org.displayName,
      description: org.description || undefined,
      type: org.type,
      slug: org.slug,
      userId: org.userId || undefined,
      settings: org.settings as Record<string, any> | undefined,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    }));
  } catch (error) {
    console.error("Error loading organizations:", error);
    throw new Error("組織データの読み込みに失敗しました");
  } finally {
    await prisma.$disconnect();
  }
}
