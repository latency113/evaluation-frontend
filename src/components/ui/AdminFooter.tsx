'use client';

export function AdminFooter() {
  return (
    <footer className="px-8 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-[11px] font-medium text-slate-400 tracking-wide">
        &copy; 2026 Admin Dashboard &bull; All Rights Reserved
      </p>
      <div className="flex gap-6">
        <span className="text-[11px] font-medium text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Documentation</span>
        <span className="text-[11px] font-medium text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Support</span>
      </div>
    </footer>
  );
}
