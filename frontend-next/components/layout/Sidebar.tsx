'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface NavLink {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

const SIDEBAR_LINKS: NavLink[] = [
  { label: 'Overview Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Documents SOPs', href: 'http://localhost:8000/admin/documents', icon: '📄', roles: ['admin', 'training_manager'] },
  { label: 'Role Requirements (RRM)', href: 'http://localhost:8000/admin/rrm', icon: '🎯', roles: ['admin', 'training_manager'] },
  { label: 'Pipeline 1 (GenAI)', href: 'http://localhost:8000/admin/pipeline1', icon: '🤖', roles: ['admin', 'training_manager'] },
  { label: 'Pipeline 2 (Audit Engine)', href: 'http://localhost:8000/admin/pipeline2', icon: '🛡️', roles: ['admin', 'training_manager'] },
  { label: 'Human Review Queue', href: 'http://localhost:8000/admin/human-review', icon: '⚖️', roles: ['admin', 'reviewer', 'training_manager'] },
  { label: 'Employee Learning Portal', href: 'http://localhost:8000/employee/dashboard', icon: '🎓', roles: ['employee', 'manager', 'admin'] },
  { label: 'Policy Update & Regeneration', href: 'http://localhost:8000/admin/policy-updates', icon: '🔄', roles: ['admin', 'training_manager'] },
  { label: 'Reports & Analytics', href: 'http://localhost:8000/admin/reports', icon: '📈', roles: ['admin', 'manager', 'training_manager'] },
  { label: 'User Management', href: '/admin/users', icon: '👥', roles: ['admin'] },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const filteredLinks = SIDEBAR_LINKS.filter(link => !link.roles || link.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col shrink-0">
      <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Role: <span className="text-indigo-400 font-bold">{role}</span>
      </div>

      <nav className="space-y-1 flex-1">
        {filteredLinks.map((link) => {
          const isActive = pathname === link.href;
          const isExternal = link.href.startsWith('http');

          return (
            <a
              key={link.href}
              href={link.href}
              target={isExternal ? '_blank' : '_self'}
              rel={isExternal ? 'noopener noreferrer' : ''}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span className="text-base">{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {isExternal && <span className="text-xs text-slate-500">↗</span>}
            </a>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 px-3">
        <p>OnBoardIQ v1.0</p>
        <p className="mt-0.5">FastAPI Backend Active</p>
      </div>
    </aside>
  );
};
