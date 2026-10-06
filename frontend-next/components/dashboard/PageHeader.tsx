import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import { Badge } from '../ui/Badge';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'neutral' | 'error';
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  badgeVariant = 'indigo',
  breadcrumbs,
  action,
  className = '',
}) => {
  return (
    <div className={`border-b border-slate-800 pb-6 mb-6 ${className}`}>
      <div className="mb-3">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h1>
            {badge && (
              <Badge variant={badgeVariant} className="uppercase text-[10px] tracking-wider">
                {badge}
              </Badge>
            )}
          </div>
          {description && <p className="mt-1.5 text-sm text-slate-400 max-w-3xl leading-relaxed">{description}</p>}
        </div>

        {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
};
