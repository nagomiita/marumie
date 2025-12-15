interface YearMonthSelectorProps {
  years: number[];
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export default function YearMonthSelector({
  years,
  year,
  month,
  onYearChange,
  onMonthChange,
}: YearMonthSelectorProps) {
  const months = [
    { value: 0, label: "全期間" },
    ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` })),
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <label className="text-sm font-semibold">対象年度</label>
      <select
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="border rounded px-3 py-1.5 text-sm"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}年度
          </option>
        ))}
      </select>

      <label className="text-sm font-semibold">月</label>
      <select
        value={month}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className="border rounded px-3 py-1.5 text-sm"
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
