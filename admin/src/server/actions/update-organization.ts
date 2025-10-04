"use server";

import { prisma } from "@/server/lib/prisma";
import { PrismaOrganizationRepository } from "@/server/repositories/prisma-organization.repository";
import {
  UpdateOrganizationUsecase,
  type UpdateOrganizationRequest,
  type UpdateOrganizationResult,
} from "@/server/usecases/update-organization-usecase";

const organizationRepository = new PrismaOrganizationRepository(prisma);
const updateUsecase = new UpdateOrganizationUsecase(organizationRepository);

export async function updateOrganization(
  data: UpdateOrganizationRequest,
): Promise<UpdateOrganizationResult> {
  try {
    const result = await updateUsecase.execute(data);
    return result;
  } catch (error) {
    console.error("Update organization action error:", error);
    return {
      ok: false,
      message: "組織の更新中にエラーが発生しました",
      errors: [error instanceof Error ? error.message : String(error)],
    };
  } finally {
    await prisma.$disconnect();
  }
}
