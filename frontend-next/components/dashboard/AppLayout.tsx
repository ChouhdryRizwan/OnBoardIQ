'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { ProtectedRoute } from '../common/ProtectedRoute';
import { UserRole } from '../../types';

export interface AppLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, allowedRoles }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans antialiased">
        {/* Sidebar Navigation */}
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Main Content Area with Sticky Topbar */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <AppTopbar
            onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />

          <main className="flex-1 bg-slate-950">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
};
