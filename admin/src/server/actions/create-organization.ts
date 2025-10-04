"use server";

import { prisma } from "@/server/lib/prisma";
import { PrismaOrganizationRepository } from "@/server/repositories/prisma-organization.repository";
import {
  CreateOrganizationUsecase,
  type CreateOrganizationRequest,
  type CreateOrganizationResult,
} from "@/server/usecases/create-organization-usecase";

const organizationRepository = new PrismaOrganizationRepository(prisma);
const createUsecase = new CreateOrganizationUsecase(organizationRepository);

export async function createOrganization(
  data: CreateOrganizationRequest,
): Promise<CreateOrganizationResult> {
  try {
    const result = await createUsecase.execute(data);
    return result;
  } catch (error) {
    console.error("Create organization action error:", error);
    return {
      ok: false,
      message: "組織の作成中にエラーが発生しました",
      errors: [error instanceof Error ? error.message : String(error)],
    };
  } finally {
    await prisma.$disconnect();
  }
}
