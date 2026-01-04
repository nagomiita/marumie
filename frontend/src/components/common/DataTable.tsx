import { type ReactNode, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  useReactTable,
  filterFns,
} from "@tanstack/react-table";
import Selector from "./Selector";
import Button from "./Button";

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const tableColumns = useMemo(
    () =>
      columns.map((col) => ({
        id: col.key,
        accessorKey: col.key,
        accessorFn: (row: T) => row[col.key],
        header: col.label,
        enableSorting: col.sortable ?? false,
        enableColumnFilter: col.filterable ?? false,
        filterFn:
          col.filterType === "select"
            ? filterFns.equalsString
            : filterFns.includesString,
        cell: ({ row }: { row: { original: T } }) =>
          col.render ? col.render(row.original) : String(row.original[col.key]),
        meta: {
          className: col.className,
          filterType: col.filterType,
          filterOptions: col.filterOptions,
        },
      })),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: filterFns.includesString,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageRows = table.getRowModel().rows;
  const totalPages = Math.max(1, table.getPageCount());
  const currentPage = table.getState().pagination.pageIndex + 1;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-3 md:p-4 space-y-3 md:space-y-4 ${className}`}
    >
      {title && (
        <h3 className="text-base md:text-lg font-semibold">
          {title} ({filteredCount}件)
        </h3>
      )}

      {pageRows.length === 0 ? (
        <p className="text-gray-600">データが存在しません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as {
                      className?: string;
                      filterType?: Column<T>["filterType"];
                      filterOptions?: string[];
                    };
                    const canSort = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        className={`py-2 pr-4 ${meta?.className || ""}`}
                      >
                        <div className="flex items-center gap-2">
                          {canSort ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="flex items-center gap-1 hover:text-gray-900 whitespace-nowrap"
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {header.column.getIsSorted() && (
                                <span className="text-xs">
                                  {header.column.getIsSorted() === "asc"
                                    ? "↑"
                                    : "↓"}
                                </span>
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-600 whitespace-nowrap">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </span>
                          )}

                          {meta?.filterType === "select" && (
                            <Selector
                              value={
                                (header.column.getFilterValue() as string) ||
                                "all"
                              }
                              options={[
                                { value: "all", label: "すべて" },
                                ...(meta?.filterOptions?.map((opt) => ({
                                  value: opt,
                                  label: opt,
                                })) || []),
                              ]}
                              onChange={(value) => {
                                header.column.setFilterValue(
                                  value === "all" ? "" : value,
                                );
                                table.setPageIndex(0);
                              }}
                              selectClassName="text-xs"
                              size="sm"
                            />
                          )}

                          {meta?.filterType === "text" && (
                            <input
                              type="text"
                              value={globalFilter}
                              onChange={(e) => {
                                setGlobalFilter(e.target.value);
                                table.setPageIndex(0);
                              }}
                              placeholder="検索..."
                              className="px-2 py-1 text-xs border border-gray-300 rounded w-32"
                            />
                          )}
                        </div>
                      </th>
                    );
                  }),
                )}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr
                  key={keyExtractor(row.original)}
                  className="border-b last:border-b-0"
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as {
                      className?: string;
                    };
                    return (
                      <td
                        key={cell.id}
                        className={`py-2 pr-4 ${meta?.className || ""}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageRows.length > 0 && totalPages > 1 && (
        <div className="flex gap-2 items-center justify-center text-xs md:text-sm pt-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            variant="secondary"
            size="sm"
          >
            前へ
          </Button>
          <span className="text-xs md:text-sm">
            {currentPage}/{totalPages}
          </span>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            variant="secondary"
            size="sm"
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
