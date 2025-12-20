import Chart from "react-apexcharts";
import Card from "@/components/common/Card";

export interface CategoryData {
  category: string;
  amount: number;
  color?: string;
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
      <Card>
        <div className="text-center text-gray-600">データが存在しません</div>
      </Card>
    );
  }

  const categories = data.map((d) => d.category);
  const amounts = data.map((d) => d.amount);
  const colors = data.map((d) => d.color || "#94A3B8");

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <Chart
        type="pie"
        height={400}
        series={amounts}
        options={{
          labels: categories,
          legend: {
            position: "right",
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
          colors: colors,
        }}
      />
    </Card>
  );
}
