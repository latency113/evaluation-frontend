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
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
        {totalItems && limit ? (
          <>แสดง {((page - 1) * limit) + 1} - {Math.min(page * limit, totalItems)} จากทั้งหมด {totalItems}</>
        ) : (
          <>หน้า {page} / {totalPages}</>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="p-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all font-bold shadow-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {showNumbers && (
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              // Logic to show limited numbers if totalPages is large
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
                    className={`w-11 h-11 rounded-lg font-bold transition-all ${
                      page === p
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              } else if (p === page - 2 || p === page + 2) {
                return (
                  <span key={p} className="flex items-end px-1 text-gray-300">
                    ...
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
          className="p-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all font-bold shadow-sm"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
