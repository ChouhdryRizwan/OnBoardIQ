import React from 'react';
import Link from 'next/link';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { StatusBadge } from '../shared/StatusBadge';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface KnowledgeOverviewProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const KnowledgeOverview: React.FC<KnowledgeOverviewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-28 bg-slate-800 rounded" />
      </Card>
    );
  }

  if (data.errors.documents) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Company Knowledge</h3>
          <span className="text-xs text-rose-400 font-semibold">API Error</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">{data.errors.documents}</p>
      </Card>
    );
  }

  const docs = data.documents || [];

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Company Knowledge</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ingested corporate policies & SOP manuals</p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {docs.length} Manuals
          </span>
        </div>

        {docs.length > 0 ? (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Document Title</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Version</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {docs.slice(0, 4).map((d) => (
                  <tr key={d.document_id || d.title} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white truncate max-w-[160px]">{d.title}</td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[120px]">{d.category}</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-400">v{d.version || '1.0'}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={d.is_active !== false ? 'completed' : 'pending'} label={d.is_active !== false ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-xl mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto text-lg mb-2">
              📄
            </div>
            <p className="text-xs font-semibold text-slate-300">No company documents uploaded yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Upload PDF, DOCX or Markdown SOP manuals in Module 1.</p>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link href="/admin/documents">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">
            Manage Documents Repository →
          </Button>
        </Link>
      </div>
    </Card>
  );
};
