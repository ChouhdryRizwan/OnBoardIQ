'use client';

import React from 'react';
import { BookOpen, RefreshCw, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface EmployeeLearningHeaderProps {
  employeeName?: string;
  roleTitle?: string;
  overallProgress?: number;
  overallStatus?: string;
  lastRefreshed?: Date;
  loading?: boolean;
  onRefresh?: () => void;
}

export function EmployeeLearningHeader({
  employeeName = 'Employee',
  roleTitle = 'Software Engineer',
  overallProgress = 0,
  overallStatus = 'On Track',
  lastRefreshed,
  loading = false,
  onRefresh,
}: EmployeeLearningHeaderProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'on track':
      case 'on_track':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {status}
          </span>
        );
      case 'requires attention':
      case 'behind schedule':
      case 'behind_schedule':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Award className="w-3.5 h-3.5 mr-1" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-100">
                  Learning & Training Workspace
                </h1>
                {getStatusBadge(overallStatus)}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Personalized onboarding roadmap, interactive policy modules, checklist tracking, and skill quizzes for <span className="font-medium text-slate-300">{employeeName}</span> ({roleTitle}).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/60">
          <div className="text-right">
            <div className="text-xs text-slate-400">Overall Progress</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-24 bg-slate-800/60 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-100">
                {Math.round(overallProgress)}%
              </span>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Learning Progress"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>
      {lastRefreshed && (
        <div className="mt-3 text-right text-xs text-slate-400">
          Last synchronized: {lastRefreshed.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
