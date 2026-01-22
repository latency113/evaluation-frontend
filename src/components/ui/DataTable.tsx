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
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-8 py-5 text-md font-semibold uppercase tracking-widest ${
                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
                  } ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && !children ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-8 py-20 text-center text-gray-400 font-bold"
                >
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : !children || (Array.isArray(children) && children.length === 0) ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-8 py-20 text-center text-gray-400 italic font-medium"
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
