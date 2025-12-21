import Selector, { type SelectorOption } from "./common/Selector";

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
  const yearOptions: SelectorOption<number>[] = [
    { value: 0, label: "全期間" },
    ...years.map((y) => ({
      value: y,
      label: `${y}年度`,
    })),
  ];

  const monthOptions: SelectorOption<number>[] = [
    { value: 0, label: "全期間" },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}月`,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 items-center">
      <Selector
        id="year-select"
        label="対象年度"
        value={year}
        options={yearOptions}
        onChange={onYearChange}
        size="md"
      />
      <Selector
        id="month-select"
        label="月"
        value={month}
        options={monthOptions}
        onChange={onMonthChange}
        size="md"
      />
    </div>
  );
}
