'use client';

import { Sidebar } from '@/src/components/ui/Sidebar';
import { AdminFooter } from '@/src/components/ui/AdminFooter';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
