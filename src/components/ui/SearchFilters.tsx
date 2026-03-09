'use client';

import { Search, RefreshCw, X } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  limit?: number;
  onLimitChange?: (value: number) => void;
  onRefresh?: () => void;
  loading?: boolean;
  placeholder?: string;
  extraFilters?: React.ReactNode;
}

export function SearchFilters({
  searchTerm,
  onSearchChange,
  limit,
  onLimitChange,
  onRefresh,
  loading,
  placeholder = "ค้นหา...",
  extraFilters,
}: SearchFiltersProps) {
  return (
    <div className="mb-6 bg-white p-2 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center gap-2 shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${loading && searchTerm ? 'text-slate-800 animate-pulse' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder={placeholder || "Search entries..."}
          className="w-full pl-11 pr-11 py-2.5 bg-transparent border-none rounded-md focus:ring-0 text-[13px] transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto px-2 pb-2 md:pb-0">
        {extraFilters}

        {onLimitChange && limit !== undefined && (
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">View</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[11px] font-bold text-slate-600 focus:ring-1 focus:ring-slate-800 outline-none cursor-pointer hover:bg-slate-100 transition-colors uppercase tracking-wider"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={9999}>ALL</option>
            </select>
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all border border-transparent hover:border-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
