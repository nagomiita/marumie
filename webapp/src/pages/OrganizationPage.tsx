import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiClient, type PoliticalOrganizationRead, type TransactionRead } from "@/api/client";
import Layout from "@/components/Layout";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import SummaryCards from "@/components/SummaryCards";
import TransactionsTable from "@/components/TransactionsTable";
import YearMonthSelector from "@/components/YearMonthSelector";

export default function OrganizationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState<PoliticalOrganizationRead[]>([]);
  const [transactions, setTransactions] = useState<TransactionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const financialYear = Number(searchParams.get("year")) || new Date().getFullYear();
  const month = Number(searchParams.get("month")) || 0;

  useEffect(() => {
    apiClient
      .listPoliticalOrganizations()
      .then((data) => {
        setOrganizations(data);
        const exists = data.some((org) => org.slug === slug);
        if (!exists && data[0]) {
          navigate(`/o/${data[0].slug}`, { replace: true });
        }
      })
      .catch((err) => setError(err.message));
  }, [navigate, slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiClient
      .listTransactions(slug, { financial_year: financialYear })
      .then((data) => setTransactions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, financialYear]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach((tx) => years.add(tx.financial_year));
    if (years.size === 0) years.add(financialYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, financialYear]);

  const monthlyData = useMemo(() => {
    const bucket = new Map<string, { income: number; expense: number }>();
    transactions.forEach((tx) => {
      const date = new Date(tx.transaction_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const current = bucket.get(key) || { income: 0, expense: 0 };
      const amount = Number(tx.credit_amount || tx.debit_amount);
      if (tx.transaction_type.includes("expense")) {
        current.expense += amount;
      } else {
        current.income += amount;
      }
      bucket.set(key, current);
    });
    return Array.from(bucket.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, val]) => ({
        monthLabel: `${Number(key.split("-")[1])}月`,
        income: val.income,
        expense: val.expense,
      }));
  }, [transactions]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.credit_amount || tx.debit_amount);
        if (tx.transaction_type.includes("expense")) {
          return { ...acc, expense: acc.expense + amount };
        }
        return { ...acc, income: acc.income + amount };
      },
      { income: 0, expense: 0 },
    );
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
    return <p className="text-gray-700">組織が選択されていません。</p>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">{slug}</p>
          <h2 className="text-3xl font-bold text-gray-900">ダッシュボード</h2>
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
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <SummaryCards income={totals.income} expense={totals.expense} />
            <MonthlyTrendChart data={monthlyData} />
            <TransactionsTable transactions={transactions} selectedMonth={month} />
          </>
        )}
      </div>
    </Layout>
  );
}
