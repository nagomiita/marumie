import "server-only";

import { prisma } from "@/server/lib/prisma";
import { PrismaOrganizationRepository } from "@/server/repositories/prisma-organization.repository";

export async function loadOrganizationData(id: string) {
  const organizationRepository = new PrismaOrganizationRepository(prisma);

  try {
    const organization = await organizationRepository.findById(id);
    return organization;
  } catch (error) {
    console.error("Error loading organization data:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
