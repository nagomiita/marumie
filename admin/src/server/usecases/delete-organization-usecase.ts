import type { OrganizationRepository } from "@/server/repositories/interfaces/organization-repository.interface";

export interface DeleteOrganizationRequest {
  id: string;
}

export interface DeleteOrganizationResult {
  ok: boolean;
  message: string;
  errors?: string[];
}

export class DeleteOrganizationUsecase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    request: DeleteOrganizationRequest,
  ): Promise<DeleteOrganizationResult> {
    try {
      // Check if organization exists
      const existingOrganization = await this.organizationRepository.findById(
        request.id,
      );
      if (!existingOrganization) {
        return {
          ok: false,
          message: "組織が見つかりません",
          errors: ["組織が存在しません"],
        };
      }

      // Delete organization
      await this.organizationRepository.delete(request.id);

      return {
        ok: true,
        message: "組織が正常に削除されました",
      };
    } catch (error) {
      console.error("Delete organization error:", error);
      return {
        ok: false,
        message: "組織の削除中にエラーが発生しました",
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}
