import Chart from "react-apexcharts";

export interface CategoryData {
  category: string;
  amount: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  title?: string;
}

export default function CategoryPieChart({
  data,
  title = "カテゴリ別支出",
}: CategoryPieChartProps) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">
        データが存在しません
      </div>
    );
  }

  const categories = data.map((d) => d.category);
  const amounts = data.map((d) => d.amount);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <Chart
        type="pie"
        height={300}
        series={amounts}
        options={{
          labels: categories,
          legend: {
            position: "bottom",
            horizontalAlign: "center",
          },
          dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`,
          },
          tooltip: {
            y: {
              formatter: (val: number) => `${Math.round(val / 10000)}万円`,
            },
          },
          colors: [
            "#2AA693",
            "#DC2626",
            "#F59E0B",
            "#3B82F6",
            "#8B5CF6",
            "#EC4899",
            "#10B981",
            "#F97316",
            "#6366F1",
            "#14B8A6",
          ],
        }}
      />
    </div>
  );
}
