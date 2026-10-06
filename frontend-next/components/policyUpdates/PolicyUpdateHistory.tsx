'use client';

import React from 'react';
import { PolicyAuditEventResponse } from '@/lib/services/policyUpdates';
import { Clock, ShieldCheck } from 'lucide-react';

interface PolicyUpdateHistoryProps {
  historyEvents: PolicyAuditEventResponse[];
  loading: boolean;
}

export function PolicyUpdateHistory({ historyEvents, loading }: PolicyUpdateHistoryProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Policy Update Audit & Propagation Log ({historyEvents.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of version detection, impact analysis, selective regeneration, and review events
          </p>
        </div>
      </div>

      {historyEvents.length === 0 ? (
        <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
          No audit history events recorded for this policy update.
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {historyEvents.map((evt) => (
            <div
              key={evt.event_id}
              className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-xs space-y-1"
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-blue-400 capitalize flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> {evt.event_type.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-400 font-mono text-[10px] font-normal">{new Date(evt.performed_at).toLocaleString()}</span>
              </div>
              <div className="text-slate-300">
                Actor: <strong className="font-semibold text-slate-100">{evt.username}</strong> • Entity: <span className="font-mono text-slate-400">{evt.entity_type}</span> (<span className="font-mono text-blue-400">{evt.entity_id}</span>)
              </div>
              {evt.reason && <div className="text-slate-400 italic text-[11px]">Reason: {evt.reason}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
