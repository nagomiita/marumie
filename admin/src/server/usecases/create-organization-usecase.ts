import type { OrganizationRepository } from "@/server/repositories/interfaces/organization-repository.interface";
import type { CreateOrganizationInput } from "@/shared/models/organization";

export interface CreateOrganizationRequest extends CreateOrganizationInput {}

export interface CreateOrganizationResult {
  ok: boolean;
  message: string;
  organizationId?: string;
  errors?: string[];
}

export class CreateOrganizationUsecase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    request: CreateOrganizationRequest,
  ): Promise<CreateOrganizationResult> {
    try {
      // Check if slug already exists
      const existingOrganization = await this.organizationRepository.findBySlug(
        request.slug,
      );
      if (existingOrganization) {
        return {
          ok: false,
          message: "組織のスラッグが既に存在します",
          errors: ["スラッグが重複しています"],
        };
      }

      // Create organization
      const organization = await this.organizationRepository.create(request);

      return {
        ok: true,
        message: "組織が正常に作成されました",
        organizationId: organization.id,
      };
    } catch (error) {
      console.error("Create organization error:", error);
      return {
        ok: false,
        message: "組織の作成中にエラーが発生しました",
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}
