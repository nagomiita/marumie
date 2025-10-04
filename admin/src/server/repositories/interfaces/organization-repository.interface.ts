import type {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/shared/models/organization";

export interface OrganizationFilter {
  userId?: string;
  type?: string;
}

export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findMany(
    filter: OrganizationFilter,
    limit?: number,
    offset?: number,
  ): Promise<Organization[]>;
  create(data: CreateOrganizationInput): Promise<Organization>;
  update(id: string, data: UpdateOrganizationInput): Promise<Organization>;
  delete(id: string): Promise<void>;
  count(filter: OrganizationFilter): Promise<number>;
}
