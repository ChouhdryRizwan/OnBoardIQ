'use client';

import React from 'react';
import Link from 'next/link';
import { ValidationReportResponse } from '@/lib/services/pipeline2';
import { UserCheck, ArrowRight, AlertTriangle } from 'lucide-react';

interface Pipeline2HumanReviewHandoffProps {
  report: ValidationReportResponse | null;
}

export function Pipeline2HumanReviewHandoff({ report }: Pipeline2HumanReviewHandoffProps) {
  if (!report) return null;

  const requiresReview = report.requires_manual_review || report.verification_status !== 'VERIFIED';

  return (
    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-xl p-6 shadow-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4 text-purple-400" />
            Human Review Workflow Handoff
          </div>
          <h3 className="text-lg font-bold text-white">Transition to Human Reviewer Queue</h3>
          <p className="text-purple-200 text-xs mt-1 max-w-2xl">
            {requiresReview
              ? 'This plan has active validation flags or missing mandatory requirements and is queued for human reviewer sign-off.'
              : 'This plan passed deterministic validation and is ready for reviewer sign-off or final deployment.'}
          </p>
        </div>

        <Link
          href="/admin/human-review"
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-md transition-colors shrink-0"
        >
          <UserCheck className="w-4 h-4" />
          Open Human Review Workspace
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {requiresReview && (
        <div className="mt-4 p-3 rounded-lg bg-black/30 border border-purple-400/30 text-xs text-purple-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Manual review queue item created for plan <strong>{report.plan_id}</strong>.</span>
        </div>
      )}
    </div>
  );
}
