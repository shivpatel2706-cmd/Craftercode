import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : currentPage * itemsPerPage;

  /* Build page number list — show at most 5 pages around current */
  const getPages = () => {
    const pages: (number | '…')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('…');
      const start = Math.max(2, currentPage - 1);
      const end   = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }
    return pages;
  };

  const btnBase =
    'inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-xl text-xs font-semibold ' +
    'transition-all duration-150 select-none';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2">
      {/* Count info */}
      {totalItems !== undefined && (
        <p className="text-xs text-neutral-500 order-2 sm:order-1">
          Showing{' '}
          <span className="font-semibold text-neutral-800">{startItem}</span>–
          <span className="font-semibold text-neutral-800">{endItem}</span>
          {' '}of{' '}
          <span className="font-semibold text-neutral-800">{totalItems}</span>
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2 sm:ml-auto">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} border border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
        </button>

        {/* Page numbers */}
        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-neutral-400 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`${btnBase} ${
                p === currentPage
                  ? 'bg-blue-500 text-white shadow-sm shadow-blue-100'
                  : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} border border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent`}
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
