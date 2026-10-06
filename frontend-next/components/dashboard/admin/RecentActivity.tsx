import React from 'react';
import { Card } from '../../ui/Card';
import { ActivityItem } from '../shared/ActivityItem';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface RecentActivityProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-20 bg-slate-800 rounded" />
      </Card>
    );
  }

  // Extract recent events from documents and review queue if available
  const events: Array<{ user: string; timestamp: string; action: string; status: string; statusVariant: 'indigo' | 'emerald' | 'amber' }> = [];

  data.documents.slice(0, 2).forEach((doc) => {
    events.push({
      user: 'SYSTEM ADMIN',
      timestamp: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recent',
      action: `Uploaded company SOP manual "${doc.title}" (v${doc.version || '1.0'}).`,
      status: 'DOCUMENT_UPLOADED',
      statusVariant: 'indigo',
    });
  });

  data.reviewQueue.slice(0, 2).forEach((item) => {
    events.push({
      user: item.reviewer_id || 'COMPLIANCE OFFICER',
      timestamp: item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'Recent',
      action: `Audited onboarding plan #${item.plan_id.substring(0, 8)} for Employee #${item.employee_id.substring(0, 8)}.`,
      status: item.status?.toUpperCase() || 'REVIEW_PENDING',
      statusVariant: 'amber',
    });
  });

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Recent System Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">Audit log of system actions & document ingestion</p>
        </div>
        <span className="text-xs font-mono text-slate-400">Audit Feed</span>
      </div>

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((ev, idx) => (
            <ActivityItem
              key={idx}
              user={ev.user}
              timestamp={ev.timestamp}
              action={ev.action}
              status={ev.status}
              statusVariant={ev.statusVariant}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto text-lg mb-2">
            📋
          </div>
          <p className="text-xs font-semibold text-slate-300">No recent activity.</p>
          <p className="text-[11px] text-slate-400 mt-1">Audit log records will appear here as system actions occur.</p>
        </div>
      )}
    </Card>
  );
};
