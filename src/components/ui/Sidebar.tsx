'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  Star,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
  { name: 'Assignments', href: '/admin/assignments', icon: ClipboardList },
  { name: 'Evaluations', href: '/admin/evaluations', icon: Star },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 overflow-y-auto border-r border-slate-800 shadow-xl">
      <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-800/50">
        <div className="bg-white p-1.5 rounded-md">
          <GraduationCap className="h-6 w-6 text-slate-900" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight uppercase">Admin Panel</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all duration-200 group ${isActive
                  ? 'bg-white text-slate-900 shadow-lg shadow-white/5'
                  : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-slate-800/50 space-y-1">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 hover:text-white transition-all group"
        >
          <Settings className="h-4.5 w-4.5 text-slate-500 group-hover:text-slate-300" />
          Settings
        </Link>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all group"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>

      <div className="px-6 py-4 bg-slate-950/50">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">v1.0.0 Alpha</p>
      </div>
    </div>
  );
}
