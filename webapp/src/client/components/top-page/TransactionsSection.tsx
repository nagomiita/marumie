"use client";
import "client-only";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import CardHeader from "@/client/components/layout/CardHeader";
import MainColumnCard from "@/client/components/layout/MainColumnCard";
import TransactionTable from "@/client/components/top-page/features/transactions-table/TransactionTable";
import PCPaginator from "@/client/components/top-page/features/transactions-table/PCPaginator";
import MobilePaginator from "@/client/components/top-page/features/transactions-table/MobilePaginator";
import TransactionTableMobileHeader, {
  type SortOption,
} from "@/client/components/top-page/features/transactions-table/TransactionTableMobileHeader";
import CsvDownloadLink from "@/client/components/transactions/CsvDownloadLink";

import type { DisplayTransaction } from "@/types/display-transaction";

interface TransactionData {
  transactions: DisplayTransaction[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

interface TransactionsSectionProps {
  transactionData: TransactionData | null;
  updatedAt: string;
  slug: string;
  organizationName?: string;
}

interface SortConfig {
  sort: "date" | "amount";
  order: "asc" | "desc";
  filterType?: "income" | "expense";
}

const SORT_CONFIGS: Record<SortOption, SortConfig> = {
  "date-desc": { sort: "date", order: "desc" },
  "date-asc": { sort: "date", order: "asc" },
  "amount-desc": { sort: "amount", order: "desc" },
  "amount-asc": { sort: "amount", order: "asc" },
  "income-desc": { sort: "amount", order: "desc", filterType: "income" },
  "expense-desc": { sort: "amount", order: "desc", filterType: "expense" },
};

const ITEMS_PER_PAGE = 50;

const MONTHS = [
  { value: 0, label: "全期間" },
  { value: 1, label: "1月" },
  { value: 2, label: "2月" },
  { value: 3, label: "3月" },
  { value: 4, label: "4月" },
  { value: 5, label: "5月" },
  { value: 6, label: "6月" },
  { value: 7, label: "7月" },
  { value: 8, label: "8月" },
  { value: 9, label: "9月" },
  { value: 10, label: "10月" },
  { value: 11, label: "11月" },
  { value: 12, label: "12月" },
];

export default function TransactionsSection({
  transactionData,
  updatedAt,
  slug,
  organizationName,
}: TransactionsSectionProps) {
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = 全期間

  // URLパラメータから月を同期
  useEffect(() => {
    if (monthParam) {
      setSelectedMonth(parseInt(monthParam, 10));
    } else {
      setSelectedMonth(0);
    }
  }, [monthParam]);

  // ソートとフィルタリング処理
  const processedData = useMemo(() => {
    if (!transactionData) return null;

    let filtered = [...transactionData.transactions];
    const config = SORT_CONFIGS[sortOption];

    // フィルタリング（月）
    if (selectedMonth > 0) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        const transactionMonth = transactionDate.getMonth() + 1;
        return transactionMonth === selectedMonth;
      });
    }

    // フィルタリング（タイプ）
    if (config.filterType) {
      filtered = filtered.filter(
        (t) => t.transactionType === config.filterType,
      );
    }

    // フィルタリング（カテゴリ）
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((t) =>
        selectedCategories.includes(t.category),
      );
    }

    // ソート
    filtered.sort((a, b) => {
      const aValue = config.sort === "date" ? a.date : a.amount;
      const bValue = config.sort === "date" ? b.date : b.amount;

      if (config.sort === "date") {
        return config.order === "asc"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      } else {
        return config.order === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
    });

    return filtered;
  }, [transactionData, sortOption, selectedCategories, selectedMonth]);

  // ページネーション処理
  const paginatedData = useMemo(() => {
    if (!processedData) return null;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTransactions = processedData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);

    return {
      transactions: paginatedTransactions,
      total: processedData.length,
      page: currentPage,
      perPage: ITEMS_PER_PAGE,
      totalPages,
    };
  }, [processedData, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSort = (field: "date" | "amount") => {
    const config = SORT_CONFIGS[sortOption];
    if (config.sort === field) {
      // 同じフィールドをクリックしたらorder反転
      const newOrder = config.order === "desc" ? "asc" : "desc";
      setSortOption(`${field}-${newOrder}` as SortOption);
    } else {
      // 別のフィールドをクリックしたらdescで開始
      setSortOption(`${field}-desc` as SortOption);
    }
    setCurrentPage(1); // ソート変更時はページをリセット
  };

  const handleMobileSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
    setCurrentPage(1);
  };

  const handleApplyFilter = (selectedKeys: string[]) => {
    setSelectedCategories(selectedKeys);
    setCurrentPage(1);
  };

  // 月選択はCashFlowSectionで制御されるため、こちらは表示のみ

  // タイトルとサブタイトルを動的に生成
  const getTitle = () => {
    if (selectedMonth > 0) {
      const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label;
      return `${monthLabel}の出入金`;
    }
    return "すべての出入金";
  };

  const getSubtitle = () => {
    if (selectedMonth > 0) {
      const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label;
      return `${monthLabel}にデータ連携された出入金の明細`;
    }
    return "これまでにデータ連携された出入金の明細";
  };

  const startItem = paginatedData
    ? (paginatedData.page - 1) * paginatedData.perPage + 1
    : 0;
  const endItem = paginatedData
    ? Math.min(paginatedData.page * paginatedData.perPage, paginatedData.total)
    : 0;

  return (
    <MainColumnCard id="transactions">
      <CardHeader
        icon={
          <Image
            src="/icons/icon-cashback.svg"
            alt="Cash move icon"
            width={30}
            height={30}
          />
        }
        organizationName={organizationName || "未登録の政治団体"}
        title={getTitle()}
        updatedAt={updatedAt}
        subtitle={getSubtitle()}
      />

      {paginatedData ? (
        <>
          {/* Mobile Header - 768px未満で表示 */}
          <div className="block md:hidden">
            <TransactionTableMobileHeader
              onSortChange={handleMobileSortChange}
              currentSort={sortOption}
            />
          </div>

          <TransactionTable
            transactions={paginatedData.transactions}
            total={paginatedData.total}
            page={paginatedData.page}
            perPage={paginatedData.perPage}
            onSort={handleSort}
            currentSort={SORT_CONFIGS[sortOption].sort}
            currentOrder={SORT_CONFIGS[sortOption].order}
            onApplyFilter={handleApplyFilter}
            selectedCategories={selectedCategories}
          />

          {/* PC Paginator - 768px以上で表示 */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                {startItem}〜{endItem}件目（全{paginatedData.total}件中）
              </div>
              <PCPaginator
                currentPage={paginatedData.page}
                totalPages={paginatedData.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>

          {/* Mobile Paginator - 768px未満で表示 */}
          <div className="block md:hidden">
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="text-sm text-gray-700">
                {startItem}〜{endItem}件目（全{paginatedData.total}件中）
              </div>
              <MobilePaginator
                currentPage={paginatedData.page}
                totalPages={paginatedData.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>

          {/* CSV Download */}
          <div className="mt-4 flex justify-end">
            <CsvDownloadLink slug={slug} />
          </div>
        </>
      ) : (
        <div className="text-gray-500 text-center py-8">
          取引データが取得できませんでした
        </div>
      )}
    </MainColumnCard>
  );
}
