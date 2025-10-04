import type { OrganizationRepository } from "@/server/repositories/interfaces/organization-repository.interface";
import type { UpdateOrganizationInput } from "@/shared/models/organization";

export interface UpdateOrganizationRequest {
  id: string;
  data: UpdateOrganizationInput;
}

export interface UpdateOrganizationResult {
  ok: boolean;
  message: string;
  errors?: string[];
}

export class UpdateOrganizationUsecase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    request: UpdateOrganizationRequest,
  ): Promise<UpdateOrganizationResult> {
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

      // Check if slug already exists (if updating slug)
      if (
        request.data.slug &&
        request.data.slug !== existingOrganization.slug
      ) {
        const slugExists = await this.organizationRepository.findBySlug(
          request.data.slug,
        );
        if (slugExists) {
          return {
            ok: false,
            message: "組織のスラッグが既に存在します",
            errors: ["スラッグが重複しています"],
          };
        }
      }

      // Update organization
      await this.organizationRepository.update(request.id, request.data);

      return {
        ok: true,
        message: "組織が正常に更新されました",
      };
    } catch (error) {
      console.error("Update organization error:", error);
      return {
        ok: false,
        message: "組織の更新中にエラーが発生しました",
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}
