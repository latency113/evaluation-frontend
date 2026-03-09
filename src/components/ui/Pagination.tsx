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
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-md border border-slate-200 shadow-sm mt-4">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {totalItems && limit ? (
          <>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, totalItems)} of {totalItems} Records</>
        ) : (
          <>Page {page} / {totalPages}</>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2.5 bg-slate-50 text-slate-500 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-all border border-slate-200"
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
                    className={`w-9 h-9 rounded-md text-xs font-bold transition-all border ${page === p
                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {p}
                  </button>
                );
              } else if (p === page - 2 || p === page + 2) {
                return (
                  <span key={p} className="flex items-center px-1 text-slate-300 text-xs">
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
          className="p-2.5 bg-slate-50 text-slate-500 rounded-md hover:bg-slate-100 disabled:opacity-30 transition-all border border-slate-200"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
