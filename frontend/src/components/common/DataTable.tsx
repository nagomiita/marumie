import { type ReactNode, useMemo, useState } from "react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "select" | "text";
  filterOptions?: string[];
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  pageSize?: number;
  title?: string;
  className?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  pageSize = 25,
  title,
  className = "",
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("desc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = data;

    // フィルタ適用
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => String(item[key]) === value);
      }
    });

    // テキスト検索
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(search),
        ),
      );
    }

    // ソート
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        let comparison = 0;
        if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filters, searchText, sortColumn, sortDirection]);

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-3 md:p-4 space-y-3 md:space-y-4 ${className}`}
    >
      {title && (
        <h3 className="text-base md:text-lg font-semibold">
          {title} ({filtered.length}件)
        </h3>
      )}

      {pageItems.length === 0 ? (
        <p className="text-gray-600">データが存在しません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-2 pr-4 ${col.className || ""}`}
                  >
                    <div className="flex items-center gap-2">
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-1 hover:text-gray-900 whitespace-nowrap"
                        >
                          {col.label}
                          {sortColumn === col.key && (
                            <span className="text-xs">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-600 whitespace-nowrap">
                          {col.label}
                        </span>
                      )}

                      {col.filterable && col.filterType === "select" && (
                        <select
                          value={filters[col.key] || "all"}
                          onChange={(e) => {
                            setFilters({
                              ...filters,
                              [col.key]: e.target.value,
                            });
                            handleFilterChange();
                          }}
                          className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                        >
                          <option value="all">すべて</option>
                          {col.filterOptions?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {col.filterable && col.filterType === "text" && (
                        <input
                          type="text"
                          value={searchText}
                          onChange={(e) => {
                            setSearchText(e.target.value);
                            handleFilterChange();
                          }}
                          placeholder="検索..."
                          className="px-2 py-1 text-xs border border-gray-300 rounded w-32"
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="border-b last:border-b-0"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-2 pr-4 ${col.className || ""}`}
                    >
                      {col.render ? col.render(item) : String(item[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageItems.length > 0 && totalPages > 1 && (
        <div className="flex gap-2 items-center justify-center text-xs md:text-sm pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 text-xs md:text-sm rounded border border-gray-300 disabled:opacity-50"
          >
            前へ
          </button>
          <span className="text-xs md:text-sm">
            {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 text-xs md:text-sm rounded border border-gray-300 disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
