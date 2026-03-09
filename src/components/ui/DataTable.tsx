'use client';

interface Column {
  header: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: Column[];
  children: React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  children,
  loading,
  emptyMessage = "ไม่พบข้อมูล",
}: DataTableProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-8 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
                    } ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && !children ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-400 font-medium text-sm"
                >
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : !children || (Array.isArray(children) && children.length === 0) ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-400 font-medium text-sm italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
