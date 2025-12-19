import Chart from "react-apexcharts";

export interface MonthlyPoint {
  monthLabel: string;
  income: number;
  expense: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyPoint[];
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">
        データが存在しません
      </div>
    );
  }

  const months = data.map((d) => d.monthLabel);
  const income = data.map((d) => d.income);
  const expense = data.map((d) => d.expense * -1);

  // 年度でグループ化するかどうかを判定（"YYYY/M"形式の場合）
  const hasYearInLabel = months.some((m) => m.includes("/"));

  // 年度グループを作成
  const xaxisOptions = hasYearInLabel
    ? {
        type: "category" as const,
        categories: months,
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: {
            fontSize: "11px",
          },
        },
        group: {
          style: {
            fontSize: "12px",
            fontWeight: 700,
          },
          groups: months.reduce(
            (groups: Array<{ title: string; cols: number }>, label, index) => {
              const year = label.split("/")[0];
              const lastGroup = groups[groups.length - 1];

              if (!lastGroup || lastGroup.title !== year) {
                groups.push({ title: year, cols: 1 });
              } else {
                lastGroup.cols++;
              }
              return groups;
            },
            [],
          ),
        },
      }
    : {
        categories: months,
      };

  return (
    <Chart
      type="line"
      height={400}
      series={[
        { name: "収入", type: "column", data: income },
        { name: "支出", type: "column", data: expense },
        {
          name: "収支",
          type: "line",
          data: data.map((d) => d.income - d.expense),
        },
      ]}
      options={{
        chart: { stacked: true, toolbar: { show: false } },
        colors: ["#2AA693", "#DC2626", "#4B5563"],
        xaxis: xaxisOptions,
        yaxis: {
          labels: {
            formatter: (val: number) => `${Math.round(val / 10000)}万円`,
          },
        },
        plotOptions: { bar: { columnWidth: "45%" } },
      }}
    />
  );
}
