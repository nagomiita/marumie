import "server-only";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RefreshButton from "@/client/components/top-page/RefreshButton";
import MainColumn from "@/client/components/layout/MainColumn";
import CashFlowSection from "@/client/components/top-page/CashFlowSection";
import MonthlyTrendsSection from "@/client/components/top-page/MonthlyTrendsSection";
import TransactionsSection from "@/client/components/top-page/TransactionsSection";
import { loadPersonalTopPageData } from "@/server/loaders/load-personal-top-page-data";
import { loadOrganizations } from "@/server/loaders/load-organizations";
import { formatUpdatedAt } from "@/server/utils/format-date";

const DEFAULT_FINANCIAL_YEAR = 2025;
export const revalidate =
  process.env.NODE_ENV === "development" ? 0 : 300; // 5 minutes

interface OrgPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    year?: string;
  }>;
}

export async function generateMetadata({
  params,
}: OrgPageProps): Promise<Metadata> {
  const { slug } = await params;

  const { organizations } = await loadOrganizations();
  const currentOrganization = organizations.find((org) => org.slug === slug);

  const title = currentOrganization?.displayName
    ? `${currentOrganization.displayName} - まる見え家計簿`
    : "まる見え家計簿";

  return {
    title,
  };
}

export default async function OrgPage({ params, searchParams }: OrgPageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);

  // slugの妥当性をチェックし、必要に応じてリダイレクト
  const { default: defaultSlug, organizations } = await loadOrganizations();
  if (!organizations.some((org) => org.slug === slug)) {
    redirect(`/o/${defaultSlug}`);
  }

  const financialYear = Number(search?.year) || DEFAULT_FINANCIAL_YEAR;
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    new Set([
      financialYear,
      DEFAULT_FINANCIAL_YEAR,
      currentYear,
      currentYear - 1,
      currentYear - 2,
    ]),
  )
    .filter((year): year is number => Number.isFinite(year))
    .sort((a, b) => b - a);

  const slugs = [slug];

  // 現在のslugに対応する組織を取得
  const currentOrganization = organizations.find((org) => org.slug === slug);

  // 統合アクションで全データを取得
  const data = await loadPersonalTopPageData({
    slugs,
    page: 1,
    perPage: 1000, // 全データを取得してクライアント側でページネーション
    financialYear,
  }).catch((error) => {
    console.error("loadPersonalTopPageData error:", error);
    return null;
  });

  const updatedAt = formatUpdatedAt(
    data?.transactionData?.lastUpdatedAt ?? null,
  );

  return (
    <MainColumn>
      <RefreshButton />
      <MonthlyTrendsSection
        monthlyData={data?.monthlyData}
        updatedAt={updatedAt}
        organizationName={currentOrganization?.displayName}
        financialYear={financialYear}
      />
      <CashFlowSection
        sankeyData={data?.sankeyData ?? null}
        summary={data?.summary ?? null}
        updatedAt={updatedAt}
        organizationName={currentOrganization?.displayName}
        slug={slug}
        financialYear={financialYear}
        availableYears={availableYears}
      />
      <TransactionsSection
        transactionData={data?.transactionData ?? null}
        updatedAt={updatedAt}
        slug={slug}
        organizationName={currentOrganization?.displayName}
        financialYear={financialYear}
      />
    </MainColumn>
  );
}
