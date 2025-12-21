interface SummaryCardsProps {
  income: number;
  expense: number;
}

import Card from "@/components/common/Card";

export default function SummaryCards({ income, expense }: SummaryCardsProps) {
  const net = income - expense;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      <Card>
        <p className="text-xs md:text-sm text-gray-600">収入</p>
        <p className="text-xl md:text-2xl font-bold text-teal-700">
          {income.toLocaleString("ja-JP")}円
        </p>
      </Card>
      <Card>
        <p className="text-xs md:text-sm text-gray-600">支出</p>
        <p className="text-xl md:text-2xl font-bold text-rose-700">
          {expense.toLocaleString("ja-JP")}円
        </p>
      </Card>
      <Card>
        <p className="text-xs md:text-sm text-gray-600">収支</p>
        <p className="text-xl md:text-2xl font-bold text-gray-900">
          {net.toLocaleString("ja-JP")}円
        </p>
      </Card>
    </div>
  );
}
