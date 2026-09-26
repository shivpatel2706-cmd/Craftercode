import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  isLoading = false,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-neutral-150 bg-white shadow-card">
      <table className="w-full text-left text-sm text-neutral-700">

        {/* Head */}
        <thead className="bg-neutral-50 border-b border-neutral-150">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-neutral-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="inline-flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                  <p className="text-xs font-medium text-neutral-400">Loading data…</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <p className="text-sm font-medium text-neutral-400">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`
                  transition-colors duration-100
                  hover:bg-neutral-50/80
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-3.5 text-neutral-800 align-middle ${col.className ?? ''}`}
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
