'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  limit?: number;
  onPageChange: (page: number) => void;
  showNumbers?: boolean;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  showNumbers = true,
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-6">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {totalItems && limit ? (
          <>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, totalItems)} of {totalItems}</>
        ) : (
          <>Page {page} of {totalPages}</>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-20 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {showNumbers && (
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              if (
                totalPages <= 7 ||
                p === 1 ||
                p === totalPages ||
                (p >= page - 1 && p <= page + 1)
              ) {
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-bold transition-all border ${page === p
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800'
                      }`}
                  >
                    {p}
                  </button>
                );
              } else if (p === page - 2 || p === page + 2) {
                return (
                  <span key={p} className="flex items-center justify-center w-8 text-slate-300">
                    &bull;&bull;&bull;
                  </span>
                );
              }
              return null;
            })}
          </div>
        )}

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-20 transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
