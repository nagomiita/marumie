interface SummaryCardsProps {
  income: number;
  expense: number;
}

export default function SummaryCards({ income, expense }: SummaryCardsProps) {
  const net = income - expense;
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-sm text-gray-600">収入</p>
        <p className="text-2xl font-bold text-teal-700">
          {income.toLocaleString("ja-JP")}円
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-sm text-gray-600">支出</p>
        <p className="text-2xl font-bold text-rose-700">
          {expense.toLocaleString("ja-JP")}円
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-sm text-gray-600">収支</p>
        <p className="text-2xl font-bold text-gray-900">
          {net.toLocaleString("ja-JP")}円
        </p>
      </div>
    </div>
  );
}
