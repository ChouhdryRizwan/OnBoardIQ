'use client';

import React from 'react';
import { DocumentMetadataResponse } from '@/lib/services/documentManagement';
import { Activity, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';

interface RecentDocumentActivityProps {
  documents: DocumentMetadataResponse[];
  loading: boolean;
}

interface ActivityLogItem {
  id: string;
  type: 'upload' | 'security_flag' | 'version_update';
  title: string;
  subtitle: string;
  timestamp: string;
}

export function RecentDocumentActivity({ documents, loading }: RecentDocumentActivityProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-800/60 rounded"></div>
          <div className="h-10 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  const logs: ActivityLogItem[] = [];

  documents.forEach((d) => {
    // Document Ingestion Log
    logs.push({
      id: `up-${d.document_id}-v${d.version}`,
      type: 'upload',
      title: `Document Processed: ${d.title}`,
      subtitle: `ID: ${d.document_id} v${d.version} • ${d.total_chunks} Chunks parsed`,
      timestamp: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent',
    });

    // Security Flag Log if flagged
    if (d.adversarial_flags_count > 0) {
      logs.push({
        id: `sec-${d.document_id}-v${d.version}`,
        type: 'security_flag',
        title: `Security Scan Flag: ${d.document_id}`,
        subtitle: `${d.adversarial_flags_count} prompt injection flag(s) detected during scan`,
        timestamp: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent',
      });
    }
  });

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Document Activity & Ingestion Log
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Audit trail of recently uploaded documents, version releases, and security scan detections
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-400 text-sm">
          No document ingestion activity logged yet.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-800 space-y-5">
          {logs.slice(0, 5).map((log) => (
            <div key={log.id} className="relative">
              <div className="absolute -left-[31px] top-0.5 p-1 rounded-full bg-slate-900 border-2 border-indigo-600">
                {log.type === 'upload' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {log.type === 'security_flag' && <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
                {log.type === 'version_update' && <Clock className="w-3.5 h-3.5 text-blue-600" />}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-100">{log.title}</span>
                  <span className="text-xs text-slate-400 font-medium">{log.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{log.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
