import React from 'react';
import { Card } from '../../ui/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface SystemHealthWidgetProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-16 bg-slate-800 rounded" />
      </Card>
    );
  }

  const health = data.health;
  const isHealthy = health?.status === 'healthy';
  const isDbConnected = health?.database === 'connected';

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white">System Health & API Connection</h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time status check from /health endpoint</p>
        </div>
        <StatusBadge
          status={isHealthy ? 'completed' : 'failed'}
          label={isHealthy ? 'SYSTEM HEALTHY' : 'CONNECTION ERROR'}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">FastAPI Backend</span>
          <span className={`font-bold font-mono ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isHealthy ? 'Connected (v1.0.0)' : 'Unavailable'}
          </span>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">SQL Database</span>
          <span className={`font-bold font-mono ${isDbConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isDbConnected ? 'Connected' : 'Checking...'}
          </span>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
          <span className="text-[11px] text-slate-400 block mb-1">Validation Engine</span>
          <span className="font-bold font-mono text-indigo-400">Pure Python Active</span>
        </div>
      </div>
    </Card>
  );
};
