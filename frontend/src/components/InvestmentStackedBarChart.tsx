import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TransactionRead } from "@/client/api/generated/model";

interface InvestmentStackedBarChartProps {
  transactions: TransactionRead[];
  categories: Array<{ id: string; name: string; color: string }>;
}

export default function InvestmentStackedBarChart({
  transactions,
  categories,
}: InvestmentStackedBarChartProps) {
  const { chartData, totalInvestment } = useMemo(() => {
    // 投資・貯蓄関連のカテゴリを抽出
    const investmentCategories = categories.filter((cat) =>
      ["投資", "貯金"].includes(cat.name),
    );

    if (investmentCategories.length === 0) {
      return { chartData: [], totalInvestment: 0 };
    }

    // 月別の合計金額を集計
    const monthlyData = new Map<string, number>();

    transactions.forEach((tx) => {
      // 投資・貯蓄カテゴリのみ
      if (!investmentCategories.some((cat) => cat.name === tx.category)) {
        return;
      }

      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;

      const amount = Math.abs(Number(tx.amount));
      const current = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, current + amount);
    });

    // 月別データをソートして累積計算
    const sortedMonths = Array.from(monthlyData.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    let cumulative = 0;
    const data = sortedMonths.map(([month, amount]) => {
      cumulative += amount;
      return {
        month,
        累積投資額: cumulative,
      };
    });

    return { chartData: data, totalInvestment: cumulative };
  }, [transactions, categories]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900">
          投資・貯蓄の推移
        </h3>
        <p className="text-sm text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">
          投資・貯蓄の推移
        </h3>
        <div className="text-right">
          <div className="text-xs text-gray-600">累積投資額</div>
          <div className="text-lg md:text-xl font-bold text-green-600">
            ¥{totalInvestment.toLocaleString("ja-JP")}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              `¥${value.toLocaleString("ja-JP", { maximumFractionDigits: 0 })}`
            }
          />
          <Tooltip
            formatter={(value: number) =>
              `¥${value.toLocaleString("ja-JP", { maximumFractionDigits: 0 })}`
            }
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.375rem",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="累積投資額" fill="#10B981" name="累積投資額" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
