'use client';

import { useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/src/components/ui/Sidebar';
import { AdminFooter } from '@/src/components/ui/AdminFooter';
import { Menu, ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const { user, loading, logout } = useAuth(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoginPage) return <>{children}</>;

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
        <p className="text-xs text-slate-400 tracking-wider">LOADING SYSTEM</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Sidebar user={user} logout={logout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:pl-72">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-blue-400">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-base text-slate-900">
              แอดมิน
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
