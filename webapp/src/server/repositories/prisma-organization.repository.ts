import type {
  Organization as PrismaOrganizationModel,
  PrismaClient,
} from "@prisma/client";
import type {
  Organization,
  OrganizationRepository,
} from "./interfaces/organization-repository.interface";

export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({
      where: { slug },
    });

    return record ? this.mapToOrganization(record) : null;
  }

  async findMany(): Promise<Organization[]> {
    const records = await this.prisma.organization.findMany({
      orderBy: { createdAt: "asc" },
    });

    return records.map(this.mapToOrganization);
  }

  async findById(id: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({
      where: { id },
    });

    return record ? this.mapToOrganization(record) : null;
  }

  private mapToOrganization(record: PrismaOrganizationModel): Organization {
    return {
      id: record.id,
      name: record.name,
      displayName: record.displayName,
      description: record.description || undefined,
      type: record.type,
      slug: record.slug,
      userId: record.userId || undefined,
      settings:
        (record.settings as Record<string, unknown> | null) ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
