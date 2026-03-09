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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg ${maxWidth} w-full p-8 shadow-xl relative border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 text-slate-400">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}
