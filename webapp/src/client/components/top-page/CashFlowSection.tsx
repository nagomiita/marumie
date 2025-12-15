"use client";
import "client-only";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import CardHeader from "@/client/components/layout/CardHeader";
import MainColumnCard from "@/client/components/layout/MainColumnCard";
import SankeyChart from "@/client/components/top-page/features/charts/SankeyChart";
import FinancialSummarySection from "@/client/components/top-page/features/financial-summary/FinancialSummarySection";

import type { SankeyData } from "@/types/sankey";

// 個人家計簿用のサマリーデータ型
interface PersonalFinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  categories: {
    income: Array<{ category: string; amount: number }>;
    expense: Array<{ category: string; amount: number }>;
  };
}

interface CashFlowSectionProps {
  sankeyData?: SankeyData | null;
  summary?: PersonalFinancialSummary | null;
  updatedAt: string;
  organizationName?: string;
  slug?: string;
  financialYear: number;
  availableYears: number[];
}

const MONTHS = [
  { value: 0, label: "年間" },
  { value: 1, label: "1月" },
  { value: 2, label: "2月" },
  { value: 3, label: "3月" },
  { value: 4, label: "4月" },
  { value: 5, label: "5月" },
  { value: 6, label: "6月" },
  { value: 7, label: "7月" },
  { value: 8, label: "8月" },
  { value: 9, label: "9月" },
  { value: 10, label: "10月" },
  { value: 11, label: "11月" },
  { value: 12, label: "12月" },
];

export default function CashFlowSection({
  sankeyData: initialSankeyData,
  summary: initialSummary,
  updatedAt,
  organizationName,
  slug,
  financialYear,
  availableYears,
}: CashFlowSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  const [selectedMonth, setSelectedMonth] = useState(
    monthParam ? parseInt(monthParam, 10) : 0,
  );
  const [selectedYear, setSelectedYear] = useState(financialYear);
  const [sankeyData, setSankeyData] = useState(initialSankeyData);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);

  const yearOptions = Array.from(
    new Set(availableYears.length ? availableYears : [financialYear]),
  ).sort((a, b) => b - a);

  useEffect(() => {
    setSelectedYear(financialYear);
    if (selectedMonth === 0) {
      setSankeyData(initialSankeyData);
      setSummary(initialSummary);
    }
  }, [financialYear, initialSankeyData, initialSummary, selectedMonth]);

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    const params = new URLSearchParams(searchParams.toString());
    if (month === 0) {
      params.delete("month");
    } else {
      params.set("month", month.toString());
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year.toString());
    params.delete("month");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (!slug || selectedMonth === 0) {
      // 年間表示の場合は初期データを使用
      setSankeyData(initialSankeyData);
      setSummary(initialSummary);
      return;
    }

    // 月が選択されたらAPIから取得
    const fetchMonthlyData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/sankey/${slug}?year=${selectedYear}&month=${selectedMonth}`,
        );
        if (response.ok) {
          const data = await response.json();
          setSankeyData(data);
          // TODO: 月別のsummaryも計算する必要がある
        }
      } catch (error) {
        console.error("Failed to fetch monthly sankey data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedMonth, selectedYear, slug, initialSankeyData, initialSummary]);

  return (
    <MainColumnCard id="cash-flow">
      <CardHeader
        icon={
          <Image
            src="/icons/icon-cashflow.svg"
            alt="Cash flow icon"
            width={30}
            height={31}
          />
        }
        organizationName={organizationName || "未登録の政治団体"}
        title="収支の流れ"
        updatedAt={updatedAt}
        subtitle="どこからお金を得て、何に使っているか"
      />

      {/* 財務サマリー */}
      <FinancialSummarySection
        sankeyData={sankeyData ?? null}
        summary={summary}
      />

      {/* 年月選択 */}
      <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="year-select"
            className="text-sm font-medium text-gray-700"
          >
            対象年度：
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}年度
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="month-select"
            className="text-sm font-medium text-gray-700"
          >
            表示期間：
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {MONTHS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* サンキー図 */}
      <div className="md:mx-0 -mx-3 mb-0">
        {loading ? (
          <div className="text-gray-500 mx-4 text-center py-8">
            データを読み込み中...
          </div>
        ) : sankeyData ? (
          <SankeyChart data={sankeyData} />
        ) : (
          <div className="text-gray-500 mx-4">
            サンキー図データが取得できませんでした
          </div>
        )}
      </div>

      {/* 更新日時 */}
      <div className="text-right md:hidden">
        <span className="text-xs font-normal text-[#9CA3AF] leading-[1.33]">
          {updatedAt}
        </span>
      </div>
    </MainColumnCard>
  );
}
