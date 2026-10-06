'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const pathname = usePathname();

  // Generate dynamic breadcrumb items if custom items are not provided
  const derivedItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const segments = pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [{ label: 'App', href: '/' }];

    let accumPath = '';
    segments.forEach((seg) => {
      accumPath += `/${seg}`;
      const formattedLabel = seg
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      result.push({ label: formattedLabel, href: accumPath });
    });

    return result;
  }, [items, pathname]);

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-xs text-slate-400 ${className}`}>
      {derivedItems.map((item, index) => {
        const isLast = index === derivedItems.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && <span className="text-slate-400 font-mono select-none">/</span>}
            {isLast || !item.href ? (
              <span className="font-semibold text-slate-200 truncate max-w-[150px] sm:max-w-xs">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-indigo-400 transition-colors truncate max-w-[120px]">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
