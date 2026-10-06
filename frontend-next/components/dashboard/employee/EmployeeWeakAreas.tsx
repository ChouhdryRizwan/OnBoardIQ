'use client';

import React from 'react';
import { AssessmentReportSummary, RecommendationItem } from '@/lib/services/employeeDashboard';
import { Target, AlertCircle, ArrowUpRight, Lightbulb, CheckCircle2 } from 'lucide-react';

interface EmployeeWeakAreasProps {
  assessments: AssessmentReportSummary | null;
  recommendations: RecommendationItem[];
  loading: boolean;
}

export function EmployeeWeakAreas({ assessments, recommendations, loading }: EmployeeWeakAreasProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-800/60 rounded mb-2"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  // Aggregate weak areas from assessment items
  const weakAreasFromAssessments: { topic: string; reason: string }[] = [];
  if (assessments?.items) {
    assessments.items.forEach((item) => {
      if (item.weak_areas && item.weak_areas.length > 0) {
        item.weak_areas.forEach((wa) => {
          weakAreasFromAssessments.push({
            topic: wa,
            reason: `Identified from lower score on module "${item.module_title}"`,
          });
        });
      } else if (item.pass_fail_result === 'failed' || item.best_score < item.passing_threshold) {
        weakAreasFromAssessments.push({
          topic: item.assessment_topic || item.module_title,
          reason: `Below target passing score threshold of ${item.passing_threshold}% (Best score: ${item.best_score}%)`,
        });
      }
    });
  }

  const recItems = recommendations || [];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Recommended Focus Areas
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Skill gaps and AI-generated learning recommendations
          </p>
        </div>
      </div>

      {weakAreasFromAssessments.length === 0 && recItems.length === 0 ? (
        <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-sm">No Active Weak Areas Identified</div>
            <div className="text-xs text-emerald-700 mt-0.5">
              You are meeting or exceeding requirements across all evaluated training topics!
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Assessment Weak Areas */}
          {weakAreasFromAssessments.map((wa, idx) => (
            <div
              key={`wa-${idx}`}
              className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">{wa.topic}</h3>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-200 text-amber-900 rounded">
                    Re-review Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{wa.reason}</p>
              </div>
            </div>
          ))}

          {/* AI Recommendations */}
          {recItems.map((rec) => (
            <div
              key={rec.recommendation_id}
              className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/40 flex items-start gap-3"
            >
              <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">{rec.recommended_action}</h3>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-indigo-100 text-indigo-800 rounded">
                    AI Recommendation
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{rec.reason}</p>
                <div className="mt-2 text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
                  Suggested Action <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
