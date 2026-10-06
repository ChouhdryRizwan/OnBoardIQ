'use client';

import React from 'react';
import { AlertCircle, Target, BookOpen } from 'lucide-react';
import { AssessmentReportSummary, EmployeeProgressReportItem, AssessmentReportItem } from '../../../lib/services/trainingDashboard';

interface LearningWeakAreasProps {
  assessments: AssessmentReportSummary | null;
  progressItems: EmployeeProgressReportItem[];
  loading: boolean;
  error?: string;
}

export const LearningWeakAreas: React.FC<LearningWeakAreasProps> = ({
  assessments,
  progressItems,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !assessments && progressItems.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <AlertCircle className="h-5 w-5 text-rose-400" />
          <h3>Identified Learning Gaps</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  // Collect weak areas from assessments and employee progress reports
  const weakAreaMap: Record<string, number> = {};

  if (assessments?.items) {
    assessments.items.forEach((item: AssessmentReportItem) => {
      if (item.weak_areas) {
        item.weak_areas.forEach((area: string) => {
          weakAreaMap[area] = (weakAreaMap[area] || 0) + 1;
        });
      }
    });
  }

  progressItems.forEach((emp: EmployeeProgressReportItem) => {
    if (emp.weak_areas) {
      emp.weak_areas.forEach((area: string) => {
        weakAreaMap[area] = (weakAreaMap[area] || 0) + 1;
      });
    }
  });

  const sortedWeakAreas = Object.entries(weakAreaMap)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, count }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-rose-400" />
            <h3 className="font-semibold text-slate-100">Learning Gaps & Weak Topics</h3>
          </div>
          <span className="text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
            {sortedWeakAreas.length} Topics Flagged
          </span>
        </div>

        {sortedWeakAreas.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No critical weak areas or knowledge gaps detected in current assessments.
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedWeakAreas.slice(0, 5).map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium text-slate-200">{item.topic}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {item.count} {item.count === 1 ? 'employee' : 'employees'} affected
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
