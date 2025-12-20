import { useMemo, useState } from "react";
import Card from "@/components/common/Card";
import type { TransactionRead } from "@/client/api/generated/model";

interface ExpenseCalendarProps {
  transactions: TransactionRead[];
  year: number;
  month: number;
}

interface DayData {
  date: number;
  income: number;
  expense: number;
  isCurrentMonth: boolean;
  transactions: TransactionRead[];
}

export default function ExpenseCalendar({
  transactions,
  year,
  month,
}: ExpenseCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const calendarData = useMemo(() => {
    // 対象月の1日と最終日を取得
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0=日曜日

    // 前月の日付を計算
    const prevMonthLastDay = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonthLastDay.getDate();

    // カレンダーデータを初期化
    const days: DayData[] = [];

    // 前月の日付を追加
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        income: 0,
        expense: 0,
        isCurrentMonth: false,
        transactions: [],
      });
    }

    // 当月の日付を追加
    for (let date = 1; date <= daysInMonth; date++) {
      days.push({
        date,
        income: 0,
        expense: 0,
        isCurrentMonth: true,
        transactions: [],
      });
    }

    // 翌月の日付を追加（6週分になるように）
    const remainingDays = 42 - days.length; // 6週 × 7日
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        income: 0,
        expense: 0,
        isCurrentMonth: false,
        transactions: [],
      });
    }

    // トランザクションデータを集計
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === year && txDate.getMonth() + 1 === month) {
        const date = txDate.getDate();
        const dayIndex = startDayOfWeek + date - 1;
        if (dayIndex < days.length && days[dayIndex].isCurrentMonth) {
          const amount = Number(tx.amount);
          if (tx.type === "expense") {
            days[dayIndex].expense += Math.abs(amount);
          } else if (tx.type === "income") {
            days[dayIndex].income += amount;
          }
          days[dayIndex].transactions.push(tx);
        }
      }
    });

    return days;
  }, [transactions, year, month]);

  // 最大支出額を取得（色の濃淡用）
  const maxExpense = useMemo(() => {
    return Math.max(...calendarData.map((d) => d.expense), 1);
  }, [calendarData]);

  const getExpenseColor = (expense: number): string => {
    if (expense === 0) return "bg-white";
    const intensity = Math.min(expense / maxExpense, 1);
    if (intensity < 0.2) return "bg-red-50";
    if (intensity < 0.4) return "bg-red-100";
    if (intensity < 0.6) return "bg-red-200";
    if (intensity < 0.8) return "bg-red-300";
    return "bg-red-400";
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  const weeks: DayData[][] = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <Card>
      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
        {year}年{month}月 支出カレンダー
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* カレンダー部分 */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-7 gap-1">
            {/* 曜日ヘッダー */}
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`text-center text-sm font-medium py-2 ${
                  index === 0
                    ? "text-red-600"
                    : index === 6
                      ? "text-blue-600"
                      : "text-gray-600"
                }`}
              >
                {day}
              </div>
            ))}

            {/* カレンダーの日付 */}
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const isWeekend = dayIndex === 0 || dayIndex === 6;
                const isSelected =
                  selectedDay?.date === day.date &&
                  selectedDay?.isCurrentMonth === day.isCurrentMonth;
                return (
                  <button
                    type="button"
                    key={`${weekIndex * 7 + dayIndex}-${day.date}-${day.isCurrentMonth}`}
                    onClick={() =>
                      day.isCurrentMonth && day.transactions.length > 0
                        ? setSelectedDay(day)
                        : null
                    }
                    className={`
                      min-h-[60px] md:min-h-[80px] p-1 md:p-2 border rounded text-left
                      ${day.isCurrentMonth ? getExpenseColor(day.expense) : "bg-gray-50"}
                      ${!day.isCurrentMonth ? "text-gray-400" : ""}
                      ${isSelected ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-blue-300"}
                      ${day.isCurrentMonth && day.transactions.length > 0 ? "cursor-pointer" : "cursor-default"}
                      transition-all
                    `}
                    disabled={
                      !day.isCurrentMonth || day.transactions.length === 0
                    }
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isWeekend && day.isCurrentMonth
                          ? dayIndex === 0
                            ? "text-red-700"
                            : "text-blue-700"
                          : ""
                      }`}
                    >
                      {day.date}
                    </div>
                    {day.isCurrentMonth && day.expense > 0 && (
                      <div className="text-xs space-y-1">
                        <div className="text-red-700 font-semibold">
                          -{(day.expense / 10000).toFixed(1)}万
                        </div>
                        {day.income > 0 && (
                          <div className="text-green-700">
                            +{(day.income / 10000).toFixed(1)}万
                          </div>
                        )}
                      </div>
                    )}
                    {day.isCurrentMonth &&
                      day.expense === 0 &&
                      day.income > 0 && (
                        <div className="text-xs">
                          <div className="text-green-700">
                            +{(day.income / 10000).toFixed(1)}万
                          </div>
                        </div>
                      )}
                  </button>
                );
              }),
            )}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
            <span>色の濃さ: 支出額の大きさを表示</span>
            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 bg-red-50 border"></div>
              <span>少</span>
              <div className="w-4 h-4 bg-red-400 border"></div>
              <span>多</span>
            </div>
          </div>
        </div>

        {/* 詳細表示部分 */}
        <div className="lg:col-span-1">
          {selectedDay && selectedDay.transactions.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900">
                {month}月{selectedDay.date}日の取引
              </h4>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {selectedDay.transactions.map((tx) => {
                  const amount = Math.abs(Number(tx.amount));
                  return (
                    <div
                      key={tx.id}
                      className="bg-white p-3 rounded border text-sm"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">
                          {tx.category}
                        </span>
                        <span
                          className={`font-semibold ${
                            tx.type === "expense"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {tx.type === "expense" ? "-" : "+"}
                          {amount.toLocaleString()}円
                        </span>
                      </div>
                      {tx.description && (
                        <p className="text-gray-600 text-xs">
                          {tx.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="pt-3 border-t space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">収入合計</span>
                  <span className="text-green-600 font-semibold">
                    +{selectedDay.income.toLocaleString()}円
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">支出合計</span>
                  <span className="text-red-600 font-semibold">
                    -{selectedDay.expense.toLocaleString()}円
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t">
                  <span>収支</span>
                  <span
                    className={
                      selectedDay.income - selectedDay.expense >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {(selectedDay.income - selectedDay.expense >= 0
                      ? "+"
                      : "") +
                      (
                        selectedDay.income - selectedDay.expense
                      ).toLocaleString()}
                    円
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              <p className="text-sm">
                取引がある日付をクリックすると
                <br />
                詳細が表示されます
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
