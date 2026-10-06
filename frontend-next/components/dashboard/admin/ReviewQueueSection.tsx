import React from 'react';
import Link from 'next/link';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { StatusBadge } from '../shared/StatusBadge';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface ReviewQueueSectionProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const ReviewQueueSection: React.FC<ReviewQueueSectionProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-24 bg-slate-800 rounded" />
      </Card>
    );
  }

  if (data.errors.reviewQueue) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Review Queue</h3>
          <span className="text-xs text-rose-400 font-semibold">API Error</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">{data.errors.reviewQueue}</p>
      </Card>
    );
  }

  const queue = data.reviewQueue || [];

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Human Review Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">Plans awaiting compliance officer sign-off</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {queue.length} Pending
          </span>
        </div>

        {queue.length > 0 ? (
          <div className="space-y-3 mb-6">
            {queue.slice(0, 4).map((item) => (
              <div key={item.review_id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Plan #{item.plan_id.substring(0, 8)}</span>
                    <span className="text-slate-400 font-mono text-[10px]">Emp: {item.employee_id.substring(0, 8)}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    Pipeline 2 Coverage: <strong className="text-emerald-400 font-mono">{item.coverage_score}%</strong>
                  </span>
                </div>
                <StatusBadge status={item.status || 'pending'} label={item.status?.toUpperCase() || 'PENDING'} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-xl mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto text-lg mb-2">
              ✓
            </div>
            <p className="text-xs font-semibold text-slate-300">No plans are currently awaiting review.</p>
            <p className="text-[11px] text-slate-400 mt-1">All generated onboarding plans have been audited or released.</p>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link href="/admin/human-review">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">
            Open Review Queue Workspace →
          </Button>
        </Link>
      </div>
    </Card>
  );
};
