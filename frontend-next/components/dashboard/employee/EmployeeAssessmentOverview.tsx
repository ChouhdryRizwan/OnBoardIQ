'use client';

import React from 'react';
import { AssessmentReportSummary } from '@/lib/services/employeeDashboard';
import { Award, CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface EmployeeAssessmentOverviewProps {
  assessments: AssessmentReportSummary | null;
  loading: boolean;
  error?: string;
  employeeName?: string;
}

export function EmployeeAssessmentOverview({
  assessments,
  loading,
  error,
  employeeName,
}: EmployeeAssessmentOverviewProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="h-16 bg-slate-800/60 rounded"></div>
          <div className="h-16 bg-slate-800/60 rounded"></div>
          <div className="h-16 bg-slate-800/60 rounded"></div>
          <div className="h-16 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !assessments) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-100 mb-2">My Quiz & Assessment Performance</h2>
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg text-sm">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error || 'Assessment records are currently unavailable.'}</span>
        </div>
      </div>
    );
  }

  // Filter for employee if applicable
  const personalItems = employeeName
    ? assessments.items.filter(
        (item) => item.employee_name && item.employee_name.toLowerCase().includes(employeeName.toLowerCase())
      )
    : assessments.items;

  const displayItems = personalItems.length > 0 ? personalItems : assessments.items;

  const avgScore = Math.round(
    displayItems.reduce((acc, curr) => acc + (curr.best_score || 0), 0) / (displayItems.length || 1)
  );

  const passedCount = displayItems.filter(
    (i) => i.pass_fail_result === 'passed' || i.pass_fail_result === 'pass'
  ).length;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            My Quiz & Assessment Results
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Scores, passing status, and attempts across assigned training topics
          </p>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-100">
          <div className="text-xs font-semibold text-indigo-700">Average Score</div>
          <div className="text-xl font-bold text-indigo-900 mt-0.5">{avgScore}%</div>
        </div>

        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="text-xs font-semibold text-emerald-700">Passed</div>
          <div className="text-xl font-bold text-emerald-900 mt-0.5">
            {passedCount} / {displayItems.length}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-purple-50 border border-purple-100">
          <div className="text-xs font-semibold text-purple-700">Pass Rate</div>
          <div className="text-xl font-bold text-purple-900 mt-0.5">
            {displayItems.length > 0 ? Math.round((passedCount / displayItems.length) * 100) : 0}%
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400">Total Assessments</div>
          <div className="text-xl font-bold text-slate-100 mt-0.5">{displayItems.length}</div>
        </div>
      </div>

      {/* Assessment items list */}
      {displayItems.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-400 text-sm">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No quiz assessments recorded for your profile yet.
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map((item, idx) => {
            const isPassed = item.pass_fail_result === 'passed' || item.pass_fail_result === 'pass';
            const scorePct = item.best_score || 0;

            return (
              <div
                key={idx}
                className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-950 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-sm text-slate-100">{item.assessment_topic || item.module_title}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                    <span>Module: {item.module_title}</span>
                    <span>•</span>
                    <span>Attempts: {item.attempts_count}</span>
                    <span>•</span>
                    <span>Passing threshold: {item.passing_threshold}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Score bar */}
                  <div className="w-28 hidden sm:block">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                      <span>Score</span>
                      <span>{scorePct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, scorePct))}%` }}
                      ></div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      isPassed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {isPassed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                    {isPassed ? 'PASSED' : 'REASSESSMENT NEEDED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
