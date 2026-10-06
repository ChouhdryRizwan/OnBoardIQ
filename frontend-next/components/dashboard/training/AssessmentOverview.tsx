'use client';

import React from 'react';
import { Award, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { AssessmentReportSummary, AssessmentReportItem } from '../../../lib/services/trainingDashboard';

interface AssessmentOverviewProps {
  assessments: AssessmentReportSummary | null;
  loading: boolean;
  error?: string;
}

export const AssessmentOverview: React.FC<AssessmentOverviewProps> = ({
  assessments,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="h-14 bg-slate-800/50 rounded"></div>
          <div className="h-14 bg-slate-800/50 rounded"></div>
          <div className="h-14 bg-slate-800/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !assessments) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <Award className="h-5 w-5 text-purple-400" />
          <h3>Assessment & Knowledge Verification</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const items = assessments?.items || [];
  const passRate = assessments?.pass_rate_percentage !== undefined ? Math.round(assessments.pass_rate_percentage) : 0;
  const avgScore = assessments?.average_score !== undefined ? Math.round(assessments.average_score) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold text-slate-100">Assessment Performance</h3>
          </div>
          <span className="text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full">
            {assessments?.total_assessments ?? 0} Total Attempts
          </span>
        </div>

        {/* Stats summary bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Pass Rate</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{passRate}%</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Average Score</div>
            <div className="text-xl font-bold text-purple-400 font-mono mt-0.5">{avgScore}%</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Retries Needed</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
              {assessments?.employees_requiring_reassessment_count ?? 0}
            </div>
          </div>
        </div>

        {/* Recent assessment attempts list */}
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No recent assessment attempts recorded.</p>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-400 mb-2">Recent Assessment Attempts</div>
            {items.slice(0, 4).map((item: AssessmentReportItem, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-medium text-slate-200">{item.employee_name}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {item.module_title || item.assessment_topic}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div className="font-mono text-slate-300 font-bold">{item.latest_score}%</div>
                  {item.pass_fail_result === 'passed' ? (
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-400" title="Passed">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  ) : item.pass_fail_result === 'failed' ? (
                    <span className="p-1 rounded bg-rose-500/10 text-rose-400" title="Failed">
                      <XCircle className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400" title="Retrying">
                      <RefreshCw className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
