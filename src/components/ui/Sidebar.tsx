'use client';

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  School,
  ClipboardList,
  ShieldCheck,
  User as UserIcon,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  user: any;
  logout: () => void;
}

export function Sidebar({ user, logout }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'หน้าแรก', icon: LayoutDashboard, href: '/admin' },
    { name: 'จัดการรายชื่อนักเรียน', icon: Users, href: '/admin/students' },
    { name: 'จัดการครูผู้สอน', icon: GraduationCap, href: '/admin/teachers' },
    { name: 'จัดการฐานข้อมูลรายวิชา', icon: BookOpen, href: '/admin/subjects' },
    { name: 'จัดการแผนกวิชา', icon: Building2, href: '/admin/departments' },
    { name: 'จัดการห้องเรียน', icon: School, href: '/admin/classrooms' },
    { name: 'จัดการการสอน', icon: ClipboardList, href: '/admin/assignments' },
    ...(user.role === 'admin' ? [{ name: 'จัดการผู้ใช้งาน', icon: UserIcon, href: '/admin/users' }] : []),
    { name: 'จัดการหัวข้อการประเมิน', icon: Settings, href: '/admin/evaluation-questions' },
    { name: 'จัดการผลการประเมิน', icon: ShieldCheck, href: '/admin/evaluations' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 overflow-hidden flex flex-col">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 border border-slate-700 text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">
              แอดมิน
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mt-1">จัดการข้อมูลผลการประเมินครูผู้สอน</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto scrollbar-hide py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-2.5 rounded-md transition-all duration-200 ${isActive
                  ? 'bg-blue-600/10 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
            >
              <item.icon className={`h-4.5 w-4.5 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-9 w-9 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
            <UserIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user.username || 'User'}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ครูผู้สอน'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center w-full px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-red-500/10 rounded-md transition-all group"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
