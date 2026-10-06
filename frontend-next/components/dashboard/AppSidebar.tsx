'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[];
  badge?: string;
  isExternal?: boolean;
}

export const ROLE_NAVIGATION: Record<string, NavItem[]> = {
  admin: [
    { label: 'Overview Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Document SOPs', href: '/admin/documents', icon: '📄' },
    { label: 'Role Matrix (RRM)', href: '/admin/rrm', icon: '🎯' },
    { label: 'Pipeline 1 (GenAI)', href: '/admin/pipeline1', icon: '🤖' },
    { label: 'Pipeline 2 (Audit)', href: '/admin/pipeline2', icon: '🛡️' },
    { label: 'Human Review Queue', href: '/admin/human-review', icon: '⚖️' },
    { label: 'Policy Updates', href: '/admin/policy-updates', icon: '🔄' },
    { label: 'Reports & Analytics', href: '/admin/reports', icon: '📈' },
    { label: 'User Management', href: '/admin/users', icon: '👥' },
  ],
  training_manager: [
    { label: 'Manager Dashboard', href: '/training/dashboard', icon: '📊' },
    { label: 'Role Matrix (RRM)', href: '/admin/rrm', icon: '🎯' },
    { label: 'Training Plans', href: '/training/plans', icon: '📋' },
    { label: 'Learning Progress', href: '/training/progress', icon: '🎓' },
    { label: 'Policy Updates', href: '/admin/policy-updates', icon: '🔄' },
    { label: 'Reports & Analytics', href: '/admin/reports', icon: '📈' },
  ],
  reviewer: [
    { label: 'Reviewer Dashboard', href: '/reviewer/dashboard', icon: '📊' },
    { label: 'Human Review Queue', href: '/admin/human-review', icon: '⚖️' },
    { label: 'Pipeline 2 Audit', href: '/admin/pipeline2', icon: '🛡️' },
    { label: 'Validation Audits', href: '/reviewer/validation', icon: '📄' },
  ],
  manager: [
    { label: 'Team Dashboard', href: '/manager/dashboard', icon: '📊' },
    { label: 'Team Progress', href: '/manager/team', icon: '👥' },
    { label: 'Training Status', href: '/manager/status', icon: '🎯' },
    { label: 'Department Reports', href: '/admin/reports', icon: '📈' },
  ],
  employee: [
    { label: 'My Learning Dashboard', href: '/employee/dashboard', icon: '📊' },
    { label: 'My Onboarding Plan', href: '/employee/onboarding', icon: '📋' },
    { label: 'Learning Modules', href: '/employee/learning', icon: '🎓' },
    { label: 'Assessments & Quizzes', href: '/employee/assessments', icon: '📝' },
    { label: 'My Profile', href: '/employee/profile', icon: '👤' },
  ],
};

export interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { role } = useAuth();

  // Normalize active role links (fallback to employee if missing)
  const navItems = ROLE_NAVIGATION[role] || ROLE_NAVIGATION['employee'];

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    training_manager: 'Training Manager',
    reviewer: 'Human Reviewer',
    manager: 'People Manager',
    employee: 'Employee',
    compliance_manager: 'Compliance Manager',
    hr_manager: 'HR Manager',
  };

  const renderNavList = (isMobile: boolean = false) => (
    <nav className="space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => isMobile && onCloseMobile()}
            title={collapsed && !isMobile ? item.label : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative group',
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
            )}
          >
            <span className="text-base shrink-0">{item.icon}</span>

            {(!collapsed || isMobile) && (
              <span className="truncate flex-1">{item.label}</span>
            )}

            {item.badge && (!collapsed || isMobile) && (
              <Badge variant="indigo" className="text-[9px] uppercase px-1 py-0">
                {item.badge}
              </Badge>
            )}

            {/* Floating Tooltip when collapsed on desktop */}
            {collapsed && !isMobile && (
              <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 1. Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Slide-Out Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between md:hidden transition-transform duration-300 ease-in-out shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                ⚡
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">OnBoardIQ</span>
            </Link>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-950/40 text-[11px] text-slate-400">
            Role: <strong className="text-indigo-400 uppercase">{roleLabels[role] || role}</strong>
          </div>

          {renderNavList(true)}
        </div>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
          OnBoardIQ Shell v1.0
        </div>
      </aside>

      {/* 3. Desktop Permanent / Collapsible Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col justify-between bg-slate-900 border-r border-slate-800 shrink-0 transition-all duration-300 sticky top-0 h-screen z-30',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div>
          {/* Header Brand */}
          <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                ⚡
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="font-extrabold text-white text-sm tracking-tight block">OnBoardIQ</span>
                  <span className="text-[10px] text-indigo-400 font-semibold block">Enterprise Shell</span>
                </div>
              )}
            </Link>

            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          {/* Active Role Bar */}
          {!collapsed && (
            <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-950/40 text-[11px] text-slate-400 truncate">
              Active Role: <span className="text-indigo-400 font-bold uppercase">{roleLabels[role] || role}</span>
            </div>
          )}

          {renderNavList(false)}
        </div>

        {/* Sidebar Footer Info */}
        {!collapsed ? (
          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-400">OnBoardIQ</p>
            <p className="mt-0.5">FastAPI Backend Connected</p>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
            v1.0
          </div>
        )}
      </aside>
    </>
  );
};
