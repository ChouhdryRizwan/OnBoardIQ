'use client';

import React from 'react';
import { AssessmentReportSummary } from '@/lib/services/reports';
import { Award, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AssessmentReportProps {
  summary: AssessmentReportSummary | null;
  loading: boolean;
}

export function AssessmentReport({ summary, loading }: AssessmentReportProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-32 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (!summary || summary.items.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-sm text-center">
        <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Assessment Results Available</h3>
        <p className="text-sm text-slate-400 mt-1">Quiz assessment metrics will populate as learners complete modules.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assessment Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Assessments</div>
          <div className="text-2xl font-black text-slate-100 mt-1 font-mono">{summary.total_assessments}</div>
          <div className="text-xs text-slate-400 mt-1">{summary.completed_assessments} Completed</div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Pass Rate</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{Math.round(summary.pass_rate_percentage)}%</div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">{summary.passed_assessments} Passed</div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Average Quiz Score</div>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">{Math.round(summary.average_score)}%</div>
          <div className="text-xs text-slate-400 mt-1">Across all attempts</div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase">Re-assessments Needed</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{summary.employees_requiring_reassessment_count}</div>
          <div className="text-xs text-amber-400 font-semibold mt-1">{summary.failed_assessments} Failed Attempts</div>
        </div>
      </div>

      {/* Assessment Items Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              Quiz Assessment Performance History ({summary.items.length} Records)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Learner test attempts, best vs latest scores, pass threshold evaluation, and weak area flags.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Learner</th>
                <th className="p-3.5">Module & Topic</th>
                <th className="p-3.5">Attempts</th>
                <th className="p-3.5">Best Score</th>
                <th className="p-3.5">Latest Score</th>
                <th className="p-3.5">Passing Threshold</th>
                <th className="p-3.5">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {summary.items.map((item, idx) => {
                const isPassed = item.pass_fail_result === 'passed';
                const isFailed = item.pass_fail_result === 'failed';
                return (
                  <tr key={`${item.employee_id}-${idx}`} className="hover:bg-slate-950/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{item.employee_name}</div>
                      <div className="text-[11px] text-slate-400">{item.role_title}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{item.module_title}</div>
                      <div className="text-[11px] text-slate-400">{item.assessment_topic}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-200 font-mono">{item.attempts_count}</td>
                    <td className="p-3.5 font-bold text-slate-100 font-mono">{item.best_score}%</td>
                    <td className="p-3.5 font-bold text-purple-400 font-mono">{item.latest_score}%</td>
                    <td className="p-3.5 text-slate-400 font-mono">{item.passing_threshold}%</td>
                    <td className="p-3.5">
                      {isPassed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Passed
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3 h-3 mr-1" /> Failed
                        </span>
                      )}
                      {!isPassed && !isFailed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3 mr-1" /> Under Review
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
