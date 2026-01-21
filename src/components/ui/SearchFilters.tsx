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
    <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
      <div className="relative flex-1 w-full group">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${loading && searchTerm ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-transparent rounded-lg focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-medium transition-all outline-none text-gray-900"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {extraFilters}
        
        {onLimitChange && limit !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-400 whitespace-nowrap">แสดงหน้าละ</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className="bg-gray-50 border-none rounded-lg px-4 py-3 font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={9999}>ทั้งหมด</option>
            </select>
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-lg transition-all shadow-sm"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
