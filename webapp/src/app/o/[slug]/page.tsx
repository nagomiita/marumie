import "server-only";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MainColumn from "@/client/components/layout/MainColumn";
import CashFlowSection from "@/client/components/top-page/CashFlowSection";
import MonthlyTrendsSection from "@/client/components/top-page/MonthlyTrendsSection";
import TransactionsSection from "@/client/components/top-page/TransactionsSection";
import { loadPersonalTopPageData } from "@/server/loaders/load-personal-top-page-data";
import { loadOrganizations } from "@/server/loaders/load-organizations";
import { formatUpdatedAt } from "@/server/utils/format-date";
import FinancialYearSelector from "@/client/components/top-page/FinancialYearSelector";

// 開発環境ではキャッシュを無効化、本番環境では5分
export const revalidate = process.env.NODE_ENV === "development" ? false : 300;

interface OrgPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}

function getDefaultFinancialYear(date = new Date()): number {
  const month = date.getMonth() + 1;
  return month >= 4 ? date.getFullYear() : date.getFullYear() - 1;
}

async function resolveSearchParams(
  searchParams?: OrgPageProps["searchParams"],
): Promise<Record<string, string | string[] | undefined>> {
  if (!searchParams) return {};
  if (typeof (searchParams as Promise<unknown>).then === "function") {
    return ((await searchParams) || {}) as Record<
      string,
      string | string[] | undefined
    >;
  }
  return searchParams as Record<string, string | string[] | undefined>;
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
  const { slug } = await params;
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const yearParam = resolvedSearchParams.year;
  const parsedYear =
    typeof yearParam === "string" ? Number.parseInt(yearParam, 10) : undefined;
  let financialYear = Number.isNaN(parsedYear)
    ? getDefaultFinancialYear()
    : (parsedYear ?? getDefaultFinancialYear());

  // slugの妥当性をチェックし、必要に応じてリダイレクト
  const { default: defaultSlug, organizations } = await loadOrganizations();
  if (!organizations.some((org) => org.slug === slug)) {
    redirect(`/o/${defaultSlug}`);
  }

  const slugs = [slug];

  // 現在のslugに対応する組織を取得
  const currentOrganization = organizations.find((org) => org.slug === slug);

  // 統合アクションで全データを取得
  let data = await loadPersonalTopPageData({
    slugs,
    page: 1,
    perPage: 1000, // 全データを取得してクライアント側でページネーション
    financialYear,
  }).catch((error) => {
    console.error("loadPersonalTopPageData error:", error);
    return null;
  });

  let availableFinancialYears =
    data?.availableFinancialYears && data.availableFinancialYears.length > 0
      ? data.availableFinancialYears
      : [financialYear];

  if (data && !availableFinancialYears.includes(financialYear)) {
    financialYear = availableFinancialYears[0] ?? getDefaultFinancialYear();
    data = await loadPersonalTopPageData({
      slugs,
      page: 1,
      perPage: 1000,
      financialYear,
    }).catch((error) => {
      console.error("loadPersonalTopPageData error:", error);
      return null;
    });
  }

  availableFinancialYears =
    data?.availableFinancialYears && data.availableFinancialYears.length > 0
      ? data.availableFinancialYears
      : [financialYear];

  const updatedAt = formatUpdatedAt(
    data?.transactionData?.lastUpdatedAt ?? null,
  );

  return (
    <MainColumn>
      <FinancialYearSelector
        years={availableFinancialYears}
        selectedYear={financialYear}
      />
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
