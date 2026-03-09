'use client';

export function AdminFooter() {
  return (
    <footer className="bg-white border-t border-slate-100 py-6 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} MT Teacher Evaluation System
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Privacy Policy</a>
          <a href="#" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Terms of Service</a>
          <a href="#" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Help Desk</a>
        </div>
      </div>
    </footer>
  );
}
