import type { PrismaClient } from "@prisma/client";
import type { Organization } from "@/shared/models/organization";
import type {
  OrganizationRepository,
  OrganizationFilter,
} from "./interfaces/organization-repository.interface";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/shared/models/organization";

export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({
      where: { id },
    });

    return record ? this.mapToOrganization(record) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const record = await this.prisma.organization.findUnique({
      where: { slug },
    });

    return record ? this.mapToOrganization(record) : null;
  }

  async findMany(
    filter: OrganizationFilter,
    limit?: number,
    offset?: number,
  ): Promise<Organization[]> {
    const records = await this.prisma.organization.findMany({
      where: this.buildWhereClause(filter),
      orderBy: [{ createdAt: "desc" }],
      take: limit,
      skip: offset,
    });

    return records.map(this.mapToOrganization);
  }

  async create(data: CreateOrganizationInput): Promise<Organization> {
    const record = await this.prisma.organization.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        type: data.type,
        slug: data.slug,
        userId: data.userId,
        settings: data.settings,
      },
    });

    return this.mapToOrganization(record);
  }

  async update(
    id: string,
    data: UpdateOrganizationInput,
  ): Promise<Organization> {
    const record = await this.prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        type: data.type,
        slug: data.slug,
        settings: data.settings,
      },
    });

    return this.mapToOrganization(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({
      where: { id },
    });
  }

  async count(filter: OrganizationFilter): Promise<number> {
    return await this.prisma.organization.count({
      where: this.buildWhereClause(filter),
    });
  }

  private buildWhereClause(filter: OrganizationFilter) {
    const where: any = {};

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.type) {
      where.type = filter.type;
    }

    return where;
  }

  private mapToOrganization(record: any): Organization {
    return {
      id: record.id,
      name: record.name,
      displayName: record.displayName,
      description: record.description,
      type: record.type,
      slug: record.slug,
      userId: record.userId,
      settings: record.settings,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
