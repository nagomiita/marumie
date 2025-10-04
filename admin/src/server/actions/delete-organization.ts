"use server";

import { prisma } from "@/server/lib/prisma";
import { PrismaOrganizationRepository } from "@/server/repositories/prisma-organization.repository";
import {
  DeleteOrganizationUsecase,
  type DeleteOrganizationRequest,
  type DeleteOrganizationResult,
} from "@/server/usecases/delete-organization-usecase";

const organizationRepository = new PrismaOrganizationRepository(prisma);
const deleteUsecase = new DeleteOrganizationUsecase(organizationRepository);

export async function deleteOrganization(
  data: DeleteOrganizationRequest,
): Promise<DeleteOrganizationResult> {
  try {
    const result = await deleteUsecase.execute(data);
    return result;
  } catch (error) {
    console.error("Delete organization action error:", error);
    return {
      ok: false,
      message: "組織の削除中にエラーが発生しました",
      errors: [error instanceof Error ? error.message : String(error)],
    };
  } finally {
    await prisma.$disconnect();
  }
}
