'use client';

import React from 'react';
import { AppLayout } from './AppLayout';
import { PageHeader } from './PageHeader';
import { DashboardPageContainer } from './DashboardPageContainer';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserRole } from '../../types';
import Link from 'next/link';

export interface ModulePlaceholderPageProps {
  title: string;
  moduleName: string;
  description: string;
  allowedRoles?: UserRole[];
  backLink?: string;
}

export const ModulePlaceholderPage: React.FC<ModulePlaceholderPageProps> = ({
  title,
  moduleName,
  description,
  allowedRoles,
  backLink = '/dashboard',
}) => {
  return (
    <AppLayout allowedRoles={allowedRoles}>
      <DashboardPageContainer>
        <PageHeader
          title={title}
          description={description}
          badge={moduleName}
          badgeVariant="indigo"
        />

        <Card className="bg-slate-900 border-slate-800 p-8 text-center max-w-2xl mx-auto shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center mx-auto text-xl font-bold mb-4">
            ⚡
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">{title} Module Placeholder</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            The shell architecture and role access rules for this module are active. The full interactive workspace interface for {moduleName} will be populated in its designated module phase.
          </p>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 mb-6 text-left">
            <span className="font-semibold text-slate-300 block mb-1">FastAPI Backend Integration:</span>
            <span>All API requests from this route carry active role credentials (<code className="text-indigo-400 font-mono">X-User-Role</code> & <code className="text-indigo-400 font-mono">X-User-Id</code>).</span>
          </div>

          <Link href={backLink}>
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:bg-slate-800">
              ← Return to Role Dashboard
            </Button>
          </Link>
        </Card>
      </DashboardPageContainer>
    </AppLayout>
  );
};
