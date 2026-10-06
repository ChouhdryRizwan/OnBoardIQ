'use client';

import React from 'react';
import Link from 'next/link';
import { AssessmentResponse } from '@/lib/services/employeeLearning';
import { Award, CheckCircle2, XCircle, Clock, PlayCircle, ArrowRight, FileText } from 'lucide-react';

interface EmployeeAssessmentListProps {
  assessments: AssessmentResponse[];
  loading: boolean;
}

export function EmployeeAssessmentList({
  assessments,
  loading,
}: EmployeeAssessmentListProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-3">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-14 bg-slate-800/60 rounded"></div>
        <div className="h-14 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const passedCount = assessments.filter((a) => a.result === 'passed').length;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Assessments & Quizzes ({assessments.length})
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Knowledge check quizzes and human reviewer evaluation history.
          </p>
        </div>

        <div className="text-sm font-semibold text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-800">
          {passedCount} of {assessments.length} Passed
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm">No assessment attempts recorded yet.</p>
          <p className="text-xs text-slate-400 mt-1">Start a module to unlock its quiz assessment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((item) => {
            const isPassed = item.result === 'passed';
            const isFailed = item.result === 'failed';
            const isReview = item.result === 'requires_review';
            const isPending = !isPassed && !isFailed && !isReview;

            return (
              <div
                key={item.assessment_id}
                className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">
                      {item.assessment_topic}
                    </h3>

                    {isPassed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Passed
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-950/80 border border-rose-800 text-rose-400">
                        <XCircle className="w-3 h-3 mr-1" /> Failed
                      </span>
                    )}
                    {isReview && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-950/80 border border-amber-800 text-amber-400">
                        <Clock className="w-3 h-3 mr-1" /> Under Review
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" /> Pending Assessment
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    Module ID: <span className="font-mono text-slate-300">{item.module_id}</span>
                    {item.assessed_at ? ` • Assessed on ${new Date(item.assessed_at).toLocaleDateString()}` : ' • Knowledge check ready'}
                  </p>

                  {item.feedback && (
                    <div className="text-xs bg-slate-950 p-2 rounded border border-slate-800/60 text-slate-400 italic">
                      Reviewer Feedback: &quot;{item.feedback}&quot;
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {item.score !== null && item.score !== undefined && (
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Score</div>
                      <div className={`text-lg font-black ${isPassed ? 'text-emerald-500' : isFailed ? 'text-rose-500' : 'text-slate-200'}`}>
                        {item.score}%
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/employee/learning/assessment/${item.module_id}`}
                    className={`px-3.5 py-1.5 font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm ${
                      isPending
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    {isPending ? 'Launch Quiz' : 'Retake Quiz'}
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
