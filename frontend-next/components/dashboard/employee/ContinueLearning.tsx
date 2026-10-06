'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackendEmployeeDashboardResponse, ModuleProgressItem } from '@/lib/services/employeeDashboard';
import { Play, CheckCircle2, Clock, BookOpen, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface ContinueLearningProps {
  dashboard: BackendEmployeeDashboardResponse | null;
  modules: ModuleProgressItem[];
  onRefreshNeeded?: () => void;
}

export function ContinueLearning({ dashboard, modules, onRefreshNeeded }: ContinueLearningProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Find currently active module (either specified by dashboard or first in-progress / assigned module)
  const currentModuleId = dashboard?.current_module_id;
  let activeModule = modules.find((m) => m.module_id === currentModuleId);
  if (!activeModule) {
    activeModule = modules.find((m) => m.completion_status === 'in_progress' || m.completion_status === 'started');
  }
  if (!activeModule) {
    activeModule = modules.find((m) => m.completion_status === 'assigned');
  }

  const handleStartModule = async (moduleId: string) => {
    setUpdating(true);
    setActionMessage(null);
    try {
      await api.post(`/api/employee/me/modules/${moduleId}/start`, {});
      setActionMessage('Module started successfully!');
      if (onRefreshNeeded) onRefreshNeeded();
      router.push(`/employee/learning/module/${moduleId}`);
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to start module');
      router.push(`/employee/learning/module/${moduleId}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteModule = async (moduleId: string) => {
    setUpdating(true);
    setActionMessage(null);
    try {
      await api.post(`/api/employee/me/modules/${moduleId}/complete`, {});
      setActionMessage('Module marked as completed!');
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to complete module');
    } finally {
      setUpdating(false);
    }
  };

  if (!activeModule && !dashboard?.current_module_title) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Active Learning Focus</span>
        </div>
        <h3 className="text-xl font-bold mb-2">All Current Modules Completed!</h3>
        <p className="text-indigo-200 text-sm mb-4">
          Great job! You have finished all active training modules assigned to your profile. Check back later for mandatory policy updates or secondary courses.
        </p>
      </div>
    );
  }

  const title = activeModule?.title || dashboard?.current_module_title || 'Active Module';
  const isStarted = activeModule?.completion_status === 'in_progress' || activeModule?.completion_status === 'started';
  const isCompleted = activeModule?.completion_status === 'completed';

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
      {/* Decorative gradient blur circle */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Next Up in Your Onboarding</span>
        </div>
        {activeModule?.is_mandatory && (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/30 text-amber-300 border border-amber-400/40">
            Mandatory Requirement
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

      {activeModule?.purpose && (
        <p className="text-indigo-200 text-sm mb-4 line-clamp-2">{activeModule.purpose}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200 mb-6">
        <span className="flex items-center gap-1.5 bg-slate-900/10 px-2.5 py-1 rounded-md">
          <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
          Stage: {dashboard?.current_stage || 'Phase 1'}
        </span>
        {activeModule?.estimated_duration_minutes && (
          <span className="flex items-center gap-1.5 bg-slate-900/10 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            {activeModule.estimated_duration_minutes} min est.
          </span>
        )}
        {activeModule?.difficulty && (
          <span className="flex items-center gap-1.5 bg-slate-900/10 px-2.5 py-1 rounded-md capitalize">
            Level: {activeModule.difficulty}
          </span>
        )}
      </div>

      {actionMessage && (
        <div className="mb-4 text-xs bg-indigo-800/80 border border-indigo-500/50 text-indigo-100 p-2.5 rounded-lg">
          {actionMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {activeModule && !isCompleted && !isStarted && (
          <button
            onClick={() => handleStartModule(activeModule.module_id)}
            disabled={updating}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            Start Learning Now
          </button>
        )}

        {activeModule && isStarted && (
          <button
            onClick={() => handleCompleteModule(activeModule.module_id)}
            disabled={updating}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Mark as Completed
          </button>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold bg-emerald-950/50 border border-emerald-500/30 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            Module Complete
          </div>
        )}

        <a
          href="/employee/learning"
          className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white font-medium ml-auto transition-colors"
        >
          View Module Details <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
