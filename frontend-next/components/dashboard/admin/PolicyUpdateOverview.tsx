import React from 'react';
import Link from 'next/link';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { StatusBadge } from '../shared/StatusBadge';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface PolicyUpdateOverviewProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const PolicyUpdateOverview: React.FC<PolicyUpdateOverviewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-24 bg-slate-800 rounded" />
      </Card>
    );
  }

  const updates = data.policyUpdates || [];

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Policy Updates & Impact Analysis</h3>
            <p className="text-xs text-slate-400 mt-0.5">Selective regeneration for updated company manuals</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {updates.length} Updates
          </span>
        </div>

        {updates.length > 0 ? (
          <div className="space-y-3 mb-6">
            {updates.slice(0, 3).map((item) => (
              <div key={item.update_id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Doc #{item.document_id.substring(0, 8)}</span>
                    <span className="text-indigo-400 font-mono text-[10px]">v{item.previous_version} → v{item.new_version}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    Impacted Plans: <strong className="text-amber-400 font-mono">{item.impacted_plans_count}</strong> | Trainees: <strong className="text-white font-mono">{item.impacted_employees_count}</strong>
                  </span>
                </div>
                <StatusBadge status={item.status || 'detected'} label={item.status?.toUpperCase() || 'DETECTED'} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-xl mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto text-lg mb-2">
              🔄
            </div>
            <p className="text-xs font-semibold text-slate-300">No policy updates detected.</p>
            <p className="text-[11px] text-slate-400 mt-1">All active onboarding plans are synchronized with current SOP manuals.</p>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link href="/admin/policy-updates">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">
            View Policy Impact & Regeneration →
          </Button>
        </Link>
      </div>
    </Card>
  );
};
