'use client';

export function AdminFooter() {
  return (
    <footer className="px-8 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        &copy; 2026 Admin Dashboard &bull; All Rights Reserved
      </p>
      <div className="flex gap-6">
        <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest cursor-help hover:text-blue-600 transition-colors">Documentation</span>
        <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest cursor-help hover:text-blue-600 transition-colors">Support</span>
      </div>
    </footer>
  );
}
