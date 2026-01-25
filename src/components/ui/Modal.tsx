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
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg ${maxWidth} w-full p-10 shadow-2xl relative border border-white/20 overflow-hidden flex flex-col max-h-[95vh]`}>
        <div className="flex justify-between items-center mb-8 border-b pb-6">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="bg-blue-600 p-3 rounded-lg shadow-lg shadow-blue-200">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-2xl text-gray-900 tracking-tight leading-none">
                {title}
              </h2>
              {subtitle && (
                <p className="text-md text-gray-400 mt-2 uppercase tracking-widest">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all active:scale-95"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}
