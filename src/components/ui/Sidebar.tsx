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
  User as UserIcon
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
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'ทะเบียนนักเรียน', icon: Users, href: '/admin/students' },
    { name: 'จัดการครูผู้สอน', icon: GraduationCap, href: '/admin/teachers' },
    { name: 'ฐานข้อมูลรายวิชา', icon: BookOpen, href: '/admin/subjects' },
    { name: 'ห้องเรียน/กลุ่มเรียน', icon: School, href: '/admin/classrooms' },
    { name: 'การจัดการสอน', icon: ClipboardList, href: '/admin/assignments' },
    { name: 'เกณฑ์การประเมิน', icon: Settings, href: '/admin/evaluation-questions' },
    { name: 'ผลการประเมิน', icon: ShieldCheck, href: '/admin/evaluations' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-[#0f172a] text-slate-300 shadow-2xl z-50 overflow-hidden flex flex-col">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-900/50">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">ADMIN</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mt-1">Control Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>{item.name}</span>
              </div>
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="rounded-xl bg-slate-800/40 p-4 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center border border-slate-600 shadow-inner">
              <UserIcon className="h-5 w-5 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">{user.username || 'Administrator'}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-3 text-xs font-black text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all group border border-red-500/20"
          >
            <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </aside>
  );
}
