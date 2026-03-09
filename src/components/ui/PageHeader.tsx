'use client';

import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="bg-slate-900 p-2.5 rounded-lg shadow-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
            {title}
          </h1>
          {description && (
            <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold italic">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
