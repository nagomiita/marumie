import "server-only";

import { prisma } from "@/server/lib/prisma";
import { PrismaOrganizationRepository } from "@/server/repositories/prisma-organization.repository";

export async function loadOrganizationsData() {
  const organizationRepository = new PrismaOrganizationRepository(prisma);

  try {
    const organizations = await organizationRepository.findMany({});
    return organizations;
  } catch (error) {
    console.error("Error loading organizations data:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
