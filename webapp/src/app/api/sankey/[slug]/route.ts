import { NextResponse } from "next/server";
import { prisma } from "@/server/lib/prisma";
import { PrismaPersonalTransactionRepository } from "@/server/repositories/prisma-personal-transaction.repository";
import { PrismaOrganizationRepository } from "@/server/repositories/prisma-organization.repository";
import { GetPersonalSankeyAggregationUsecase } from "@/server/usecases/get-personal-sankey-aggregation-usecase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString(),
      10,
    );
    const monthParam = searchParams.get("month");
    const month = monthParam ? parseInt(monthParam, 10) : undefined;

    const personalTransactionRepository =
      new PrismaPersonalTransactionRepository(prisma);
    const organizationRepository = new PrismaOrganizationRepository(prisma);

    const sankeyUsecase = new GetPersonalSankeyAggregationUsecase(
      personalTransactionRepository,
      organizationRepository,
    );

    const result = await sankeyUsecase.execute({
      slugs: [slug],
      financialYear: year,
      month,
    });

    return NextResponse.json(result.sankeyData);
  } catch (error) {
    console.error("Sankey API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sankey data" },
      { status: 500 },
    );
  }
}
