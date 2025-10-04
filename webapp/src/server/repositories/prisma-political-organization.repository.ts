import type {
  PrismaClient,
  PoliticalOrganization as PrismaPoliticalOrganization,
} from "@prisma/client";
import type { PoliticalOrganization } from "@/shared/models/political-organization";
import type { IPoliticalOrganizationRepository } from "./interfaces/political-organization-repository.interface";

export class PrismaPoliticalOrganizationRepository
  implements IPoliticalOrganizationRepository
{
  constructor(private prisma: PrismaClient) {}

  async findBySlug(slug: string): Promise<PoliticalOrganization | null> {
    const organization = await this.prisma.politicalOrganization.findUnique({
      where: { slug },
    });

    return organization ? this.mapToPoliticalOrganization(organization) : null;
  }

  async findBySlugs(slugs: string[]): Promise<PoliticalOrganization[]> {
    console.log("[PrismaPoliticalOrganizationRepository] findBySlugs called", {
      slugs,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
    });

    try {
      const organizations = await this.prisma.politicalOrganization.findMany({
        where: { slug: { in: slugs } },
      });

      console.log(
        "[PrismaPoliticalOrganizationRepository] Organizations found:",
        {
          requestedSlugs: slugs,
          foundCount: organizations.length,
          foundSlugs: organizations.map((org) => org.slug),
          organizations: organizations.map((org) => ({
            id: org.id.toString(),
            slug: org.slug,
            displayName: org.displayName,
          })),
        },
      );

      if (organizations.length === 0) {
        console.warn(
          "[PrismaPoliticalOrganizationRepository] No organizations found for slugs:",
          slugs,
        );
      } else if (organizations.length < slugs.length) {
        const foundSlugs = organizations.map((org) => org.slug);
        const missingSlugs = slugs.filter((slug) => !foundSlugs.includes(slug));
        console.warn(
          "[PrismaPoliticalOrganizationRepository] Some organizations not found:",
          {
            requested: slugs,
            found: foundSlugs,
            missing: missingSlugs,
          },
        );
      }

      return organizations.map((org) => this.mapToPoliticalOrganization(org));
    } catch (error) {
      console.error(
        "[PrismaPoliticalOrganizationRepository] Error finding organizations by slugs:",
        {
          error: error instanceof Error ? error.message : error,
          slugs,
          timestamp: new Date().toISOString(),
        },
      );
      throw error;
    }
  }

  async findById(id: string): Promise<PoliticalOrganization | null> {
    const organization = await this.prisma.politicalOrganization.findUnique({
      where: { id: BigInt(id) },
    });

    return organization ? this.mapToPoliticalOrganization(organization) : null;
  }

  async findAll(): Promise<PoliticalOrganization[]> {
    const organizations = await this.prisma.politicalOrganization.findMany({
      orderBy: { displayName: "asc" },
    });

    return organizations.map((org) => this.mapToPoliticalOrganization(org));
  }

  private mapToPoliticalOrganization(
    prismaOrganization: PrismaPoliticalOrganization,
  ): PoliticalOrganization {
    return {
      id: prismaOrganization.id.toString(),
      displayName: prismaOrganization.displayName,
      orgName: prismaOrganization.orgName,
      slug: prismaOrganization.slug,
      description: prismaOrganization.description,
      createdAt: prismaOrganization.createdAt,
      updatedAt: prismaOrganization.updatedAt,
    };
  }
}
