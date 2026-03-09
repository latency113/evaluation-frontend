'use client';

import { X, LucideIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = "max-w-xl",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className={`bg-white rounded-lg ${maxWidth} w-full shadow-2xl relative border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="bg-slate-100 p-2 rounded-md border border-slate-200">
                <Icon className="h-4.5 w-4.5 text-slate-500" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none uppercase">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.15em] font-bold italic">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-transparent hover:border-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-8 scrollbar-hide text-sm text-slate-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
