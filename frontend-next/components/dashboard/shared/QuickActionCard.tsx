import React from 'react';
import Link from 'next/link';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

export interface QuickActionCardProps {
  title: string;
  subtitle?: string;
  description: string;
  icon?: string;
  href: string;
  buttonText?: string;
  isExternal?: boolean;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  subtitle,
  description,
  icon = '⚡',
  href,
  buttonText = 'Open Module →',
  isExternal = false,
}) => {
  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{icon}</span>
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        {subtitle && <p className="text-[11px] font-medium text-indigo-400 mb-2">{subtitle}</p>}
        <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>
      </div>

      {isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">
            {buttonText} ↗
          </Button>
        </a>
      ) : (
        <Link href={href}>
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">
            {buttonText}
          </Button>
        </Link>
      )}
    </Card>
  );
};
