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
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
                    } ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700 font-medium">
            {loading && !children ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-slate-400 uppercase tracking-widest text-[10px] font-bold italic"
                >
                  Synchronizing Data...
                </td>
              </tr>
            ) : !children || (Array.isArray(children) && children.length === 0) ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-slate-400 text-xs italic font-medium"
                >
                  No records available in this view.
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
