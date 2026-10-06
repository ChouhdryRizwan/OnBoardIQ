'use client';

import React from 'react';
import { Activity, Database, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { HealthCheckResponse, ReviewQueueItemResponse } from '../../../lib/services/reviewerDashboard';

interface ReviewHealthProps {
  health: HealthCheckResponse | null;
  reviewQueue: ReviewQueueItemResponse[];
  loading: boolean;
  error?: string;
}

export const ReviewHealth: React.FC<ReviewHealthProps> = ({
  health,
  reviewQueue,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      </div>
    );
  }

  const isHealthy = health?.status === 'ok' || health?.status === 'healthy';

  const totalReviews = reviewQueue.length;
  const approvedCount = reviewQueue.filter((i) => i.status === 'approved').length;
  const reviewCompletionRate = totalReviews > 0 ? Math.round((approvedCount / totalReviews) * 100) : 'Unavailable';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isHealthy ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
            <span>OnBoardIQ Review Engine Services</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isHealthy
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {health?.status ? health.status.toUpperCase() : 'UNKNOWN'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-3 font-mono">
            <span>Service: {health?.service || 'OnBoardIQ Backend'}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Database className="h-3 w-3 text-slate-400" />
              <span>DB: {health?.database || (error ? 'Disconnected' : 'Connected')}</span>
            </span>
            <span>•</span>
            <span>v{health?.version || '1.0.0'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-xs font-mono">
        <div className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-slate-400">Review Completion:</span>
          <span className="text-slate-100 font-bold">{reviewCompletionRate}%</span>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-slate-400">
          <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Pipeline 2 Active</span>
        </div>
      </div>
    </div>
  );
};
