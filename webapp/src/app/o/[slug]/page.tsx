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

export const revalidate = 300; // 5 minutes

interface OrgPageProps {
  params: Promise<{
    slug: string;
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

export default async function OrgPage({ params }: OrgPageProps) {
  const { slug } = await params;

  // slugの妥当性をチェックし、必要に応じてリダイレクト
  const { default: defaultSlug, organizations } = await loadOrganizations();
  if (!organizations.some((org) => org.slug === slug)) {
    redirect(`/o/${defaultSlug}`);
  }

  const slugs = [slug];

  // 現在のslugに対応する組織を取得
  const currentOrganization = organizations.find((org) => org.slug === slug);

  // 統合アクションで全データを取得
  const data = await loadPersonalTopPageData({
    slugs,
    page: 1,
    perPage: 1000, // 全データを取得してクライアント側でページネーション
    financialYear: 2025, // デフォルト値
  }).catch((error) => {
    console.error("loadPersonalTopPageData error:", error);
    return null;
  });

  const updatedAt = formatUpdatedAt(
    data?.transactionData?.lastUpdatedAt ?? null,
  );

  return (
    <MainColumn>
      <MonthlyTrendsSection
        monthlyData={data?.monthlyData}
        updatedAt={updatedAt}
        organizationName={currentOrganization?.displayName}
      />
      <CashFlowSection
        sankeyData={data?.sankeyData ?? null}
        summary={data?.summary ?? null}
        updatedAt={updatedAt}
        organizationName={currentOrganization?.displayName}
        slug={slug}
      />
      <TransactionsSection
        transactionData={data?.transactionData ?? null}
        updatedAt={updatedAt}
        slug={slug}
        organizationName={currentOrganization?.displayName}
      />
    </MainColumn>
  );
}
