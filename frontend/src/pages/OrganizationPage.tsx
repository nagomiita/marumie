import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useGetOrganization,
  useListOrganizations,
} from "@/client/api/generated/organizations/organizations";
import {
  useGetAvailableYears,
  useListPersonalTransactions,
} from "@/client/api/generated/personal-transactions/personal-transactions";
import type { PersonalTransactionRead } from "@/client/api/generated/model";
import Layout from "@/components/Layout";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import SummaryCards from "@/components/SummaryCards";
import TransactionsTable from "@/components/TransactionsTable";
import YearMonthSelector from "@/components/YearMonthSelector";
import CategoryPieChart from "@/components/CategoryPieChart";
import ExpenseCalendar from "@/components/ExpenseCalendar";
import SankeyDiagram from "@/components/SankeyDiagram";

export default function OrganizationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // year=0は全期間、未指定の場合もデフォルトで全期間表示
  const yearParam = searchParams.get("year");
  const financialYear = yearParam !== null ? Number(yearParam) : 0;
  const month = Number(searchParams.get("month")) || 0;

  // 組織一覧を取得（リダイレクト用）
  const { data: orgsData } = useListOrganizations();

  // 現在の組織を取得
  const {
    data: orgData,
    isLoading: orgLoading,
    error: orgError,
  } = useGetOrganization(slug || "", {
    query: { enabled: !!slug },
  });

  const organization = orgData?.data;

  // 年リスト取得（軽量）
  const { data: yearsData } = useGetAvailableYears(
    {
      organization_id:
        organization && "id" in organization ? organization.id : undefined,
    },
    { query: { enabled: !!organization && "id" in organization } },
  );

  // トランザクションを取得
  const {
    data: txData,
    isLoading: txLoading,
    error: txError,
  } = useListPersonalTransactions(
    {
      organization_id:
        organization && "id" in organization ? organization.id : undefined,
      year: financialYear === 0 ? undefined : financialYear,
      month: month || undefined,
      limit: 9000,
    },
    { query: { enabled: !!organization && "id" in organization } },
  );

  const transactions = Array.isArray(txData?.data) ? txData.data : [];
  const availableYearsFromAPI = Array.isArray(yearsData?.data)
    ? yearsData.data
    : [];
  const loading = orgLoading || txLoading;
  const error = orgError || txError;

  // 組織が見つからない場合、最初の組織にリダイレクト
  useEffect(() => {
    if (
      orgError &&
      orgsData?.data &&
      Array.isArray(orgsData.data) &&
      orgsData.data.length > 0
    ) {
      navigate(`/o/${orgsData.data[0].slug}`, { replace: true });
    }
  }, [orgError, orgsData, navigate]);

  // APIから取得した年リスト（降順でソート済み）
  const availableYears = useMemo(() => {
    return availableYearsFromAPI;
  }, [availableYearsFromAPI]);

  const monthlyData = useMemo(() => {
    const bucket = new Map<string, { income: number; expense: number }>();
    transactions.forEach((tx: PersonalTransactionRead) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const current = bucket.get(key) || { income: 0, expense: 0 };
      const amount = Number(tx.amount);
      if (tx.type === "expense") {
        current.expense += amount;
      } else if (tx.type === "income") {
        current.income += amount;
      }
      bucket.set(key, current);
    });
    return Array.from(bucket.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, val]) => {
        const [year, month] = key.split("-");
        // 全期間表示の場合は年も含める
        const monthLabel =
          financialYear === 0
            ? `${year}/${Number(month)}`
            : `${Number(month)}月`;
        return {
          monthLabel,
          income: val.income,
          expense: val.expense,
        };
      });
  }, [transactions, financialYear]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (
        acc: { income: number; expense: number },
        tx: PersonalTransactionRead,
      ) => {
        const amount = Number(tx.amount);
        if (tx.type === "expense") {
          acc.expense += amount;
        } else if (tx.type === "income") {
          acc.income += amount;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    transactions.forEach((tx: PersonalTransactionRead) => {
      if (tx.type === "expense") {
        const amount = Number(tx.amount);
        const current = categoryMap.get(tx.category) || 0;
        categoryMap.set(tx.category, current + amount);
      }
    });
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const handleYearChange = (year: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("year", `${year}`);
      next.delete("month");
      return next;
    });
  };

  const handleMonthChange = (nextMonth: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextMonth === 0) {
        next.delete("month");
      } else {
        next.set("month", `${nextMonth}`);
      }
      return next;
    });
  };

  if (!slug) {
    return (
      <Layout>
        <p className="text-gray-700">組織が選択されていません。</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-1 md:gap-2">
          <p className="text-xs md:text-sm text-gray-500">
            {organization && "display_name" in organization
              ? String(organization.display_name)
              : organization && "name" in organization
                ? String(organization.name)
                : slug}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            ダッシュボード
          </h2>
        </div>

        <YearMonthSelector
          years={availableYears}
          year={financialYear}
          month={month}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
        />

        {loading ? (
          <p className="text-gray-700">読込中...</p>
        ) : error ? (
          <p className="text-red-600">
            データ取得に失敗しました: {String(error)}
          </p>
        ) : (
          <>
            <SummaryCards income={totals.income} expense={totals.expense} />
            <SankeyDiagram transactions={transactions} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <MonthlyTrendChart data={monthlyData} />
              <CategoryPieChart data={categoryData} />
            </div>
            {financialYear !== 0 && month !== 0 && (
              <ExpenseCalendar
                transactions={transactions}
                year={financialYear}
                month={month}
              />
            )}
            <TransactionsTable
              transactions={transactions}
              selectedMonth={month}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
