"use client";
import "client-only";

import { PL_CATEGORIES } from "@/shared/utils/category-mapping";
import type { DisplayTransaction } from "@/types/display-transaction";

interface TransactionTableRowProps {
  transaction: DisplayTransaction;
}

export default function TransactionTableRow({
  transaction,
}: TransactionTableRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "decimal",
      useGrouping: true,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}.${month}.${day}`;
  };

  const getCategoryLabel = (transaction: DisplayTransaction) => {
    // Use shortLabel from Figma design
    return transaction.category;
  };

  const getDisplayTitle = (transaction: DisplayTransaction) => {
    return transaction.label;
  };

  const getCategoryColors = (transaction: DisplayTransaction) => {
    // Find mapping based on account (original account name)
    const mapping = PL_CATEGORIES[transaction.account];
    const color = mapping?.color;

    if (color) {
      // 収入・支出共に白抜きで文字と線が色
      return {
        fontColor: color,
        borderColor: color,
        bgColor: "#FFFFFF",
      };
    }

    // フォールバック: マッピングが見つからない場合
    return {
      fontColor: "#47474C",
      borderColor: "#99F6E4",
      bgColor: "#FFFFFF",
    };
  };

  const isIncome = transaction.transactionType === "income";
  const categoryColors = getCategoryColors(transaction);

  return (
    <tr className="w-full border-b border-[#D5DBE1]">
      {/* SP Layout - Mobile Card Layout */}
      <td colSpan={5} className="md:hidden p-0">
        <div className="flex flex-col bg-white gap-1 px-0 py-2">
          {/* Date section */}
          <div className="flex">
            <span className="text-xs text-[#4B5563] font-normal">
              {formatDate(transaction.date)}
            </span>
          </div>

          {/* Title and Amount section */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-gray-800 flex-1 leading-[1.43em]">
              {getDisplayTitle(transaction)}
            </span>
            <span
              className={`text-base font-bold text-right ${
                isIncome ? "text-[#238778]" : "text-[#DC2626]"
              }`}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(Math.abs(transaction.amount))}
              <span className="text-[10px] text-gray-600 font-normal"> 円</span>
            </span>
          </div>

          {/* Category label section */}
          <div className="flex items-center">
            <div
              className="flex items-center gap-2 px-2 py-0.5 rounded-full border h-[18px]"
              style={{
                backgroundColor: categoryColors.bgColor,
                borderColor: categoryColors.borderColor,
              }}
            >
              <span
                className="text-xs font-medium text-left leading-[1em]"
                style={{
                  color: categoryColors.fontColor,
                }}
              >
                {getCategoryLabel(transaction)}
              </span>
            </div>
          </div>

          {/* Description section */}
          {transaction.description && (
            <div className="flex">
              <span className="text-xs font-bold font-normal leading-[1.33em]">
                {transaction.description}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Desktop Layout - Table row layout */}
      {/* Date column - 140px width */}
      <td className="hidden md:table-cell px-4 h-16 w-[140px]">
        <span className="leading-4 font-bold text-base text-gray-800">
          {formatDate(transaction.date)}
        </span>
      </td>

      {/* Category column - 160px width */}
      <td className="hidden md:table-cell pl-4 h-16 w-[160px]">
        <div className="flex justify-start items-center h-11">
          <div
            className="flex flex-col justify-center items-center gap-2 px-3 rounded-full border"
            style={{
              backgroundColor: categoryColors.bgColor,
              borderColor: categoryColors.borderColor,
            }}
          >
            <span
              className="font-medium text-xs leading-[1.67em] text-left"
              style={{
                color: categoryColors.fontColor,
              }}
            >
              {getCategoryLabel(transaction)}
            </span>
          </div>
        </div>
      </td>

      {/* Title column - 200px width */}
      <td className="hidden md:table-cell h-16 w-[200px]">
        <span className="leading-7 font-bold text-base text-gray-800">
          {getDisplayTitle(transaction)}
        </span>
      </td>

      {/* Description column - flexible width */}
      <td className="hidden md:table-cell h-16 px-2">
        <span className="leading-6 text-sm font-bold ">
          {transaction.description || ""}
        </span>
      </td>

      {/* Amount column - 180px width */}
      <td className="hidden md:table-cell text-right pr-6 h-16 w-[180px]">
        <span
          className={`leading-[1em] font-bold text-xl tracking-[0.01em] ${
            isIncome ? "text-[#238778]" : "text-[#DC2626]"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(Math.abs(transaction.amount))}
          <span className="text-[12px] text-gray-600 font-normal"> 円</span>
        </span>
      </td>
    </tr>
  );
}
