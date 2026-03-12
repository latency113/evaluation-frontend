'use client';

export function AdminFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 md:py-8 px-6 md:px-8 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center text-[10px] text-blue-400">
            NC
          </div>
          <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">
            &copy; 2026 Nakhornpathom Vocational College
          </p>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-[10px] md:text-xs text-slate-300 uppercase tracking-widest hover:text-blue-500 cursor-pointer transition-colors">
            Terms of Service
          </p>
          <p className="text-[10px] md:text-xs text-slate-300 uppercase tracking-widest hover:text-blue-500 cursor-pointer transition-colors">
            Privacy Policy
          </p>
        </div>
      </div>
    </footer>
  );
}
