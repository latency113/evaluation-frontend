'use client';

import { useAuth } from '@/src/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/src/components/ui/Sidebar';
import { AdminFooter } from '@/src/components/ui/AdminFooter';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const { user, loading, logout } = useAuth(true);

  if (isLoginPage) return <>{children}</>;

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest text-xs">กำลังโหลดระบบ...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Sidebar user={user} logout={logout} />

      <div className="flex-1 pl-72 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </main>
        
        <AdminFooter />
      </div>
    </div>
  );
}
