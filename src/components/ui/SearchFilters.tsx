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
  placeholder = "Search...",
  extraFilters,
}: SearchFiltersProps) {
  return (
    <div className="mb-8 border border-slate-200 rounded-lg p-2 bg-white flex flex-col md:flex-row items-center gap-2 shadow-sm">
      <div className="relative flex-1 w-full group">
        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${loading && searchTerm ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-transparent rounded-md focus:border-slate-300 focus:bg-white transition-all outline-none text-sm text-slate-900 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 px-2">
        {extraFilters}

        {onLimitChange && limit !== undefined && (
          <div className="flex items-center gap-3 ml-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider whitespace-nowrap">Show</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-600 focus:ring-1 focus:ring-slate-300 cursor-pointer outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={9999}>All</option>
            </select>
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-md transition-all hover:bg-slate-100 ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
