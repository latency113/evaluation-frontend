'use client';

import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="bg-blue-100 p-2 rounded-lg">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center uppercase">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 font-medium mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-3 w-full md:w-auto">{actions}</div>}
    </div>
  );
}
