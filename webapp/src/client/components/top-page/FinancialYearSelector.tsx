"use client";
import "client-only";

import { useRouter, useSearchParams } from "next/navigation";

interface FinancialYearSelectorProps {
  years: number[];
  selectedYear: number;
}

export default function FinancialYearSelector({
  years,
  selectedYear,
}: FinancialYearSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const uniqueYears =
    years.length > 0
      ? Array.from(new Set(years)).sort((a, b) => b - a)
      : [selectedYear];

  const handleChange = (year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(year));
    // 年度が変わった場合は月フィルターをリセット
    params.delete("month");
    const query = params.toString();
    router.push(query ? `?${query}` : "?", { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-gray-600">表示する年度を選択</p>
        <p className="text-lg font-semibold">
          {selectedYear}年度（{selectedYear}年4月〜{selectedYear + 1}年3月）
        </p>
      </div>
      <select
        className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={selectedYear}
        onChange={(e) => handleChange(Number(e.target.value))}
      >
        {uniqueYears.map((year) => (
          <option key={year} value={year}>
            {year}年度
          </option>
        ))}
      </select>
    </div>
  );
}
