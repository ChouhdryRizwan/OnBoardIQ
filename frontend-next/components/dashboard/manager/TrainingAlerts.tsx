'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, Award, Clock, ArrowRight } from 'lucide-react';
import {
  EmployeeProgressReportItem,
  MandatoryTrainingReportItem,
  AssessmentReportSummary,
  AssessmentReportItem,
} from '../../../lib/services/managerDashboard';

interface TrainingAlertsProps {
  progressItems: EmployeeProgressReportItem[];
  mandatoryItems: MandatoryTrainingReportItem[];
  assessments: AssessmentReportSummary | null;
  loading: boolean;
}

export const TrainingAlerts: React.FC<TrainingAlertsProps> = ({
  progressItems,
  mandatoryItems,
  assessments,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Construct real alert items from current state
  const alerts: Array<{
    id: string;
    type: 'behind' | 'mandatory' | 'assessment';
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'info';
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }> = [];

  // 1. Behind schedule employees
  progressItems
    .filter((emp) => emp.current_status === 'behind_schedule' || emp.current_status === 'requires_attention')
    .forEach((emp) => {
      alerts.push({
        id: `alert-behind-${emp.employee_id}`,
        type: 'behind',
        title: `${emp.employee_name} is behind schedule`,
        description: `Overall progress at ${Math.round(emp.overall_progress_percentage)}% (${emp.completed_modules}/${emp.total_modules} modules completed)`,
        severity: 'high',
        icon: AlertTriangle,
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10',
      });
    });

  // 2. Outstanding mandatory training items
  mandatoryItems
    .filter((item) => item.completion_status !== 'completed')
    .slice(0, 3)
    .forEach((item, idx) => {
      alerts.push({
        id: `alert-mand-${item.requirement_id || idx}`,
        type: 'mandatory',
        title: `Mandatory Requirement Pending: ${item.employee_name}`,
        description: `Topic: ${item.requirement_title} (Role: ${item.role_title || item.role_code})`,
        severity: 'medium',
        icon: ShieldAlert,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
      });
    });

  // 3. Failed assessment attempts
  if (assessments?.items) {
    assessments.items
      .filter((item: AssessmentReportItem) => item.pass_fail_result === 'failed' || item.pass_fail_result === 'requires_review')
      .slice(0, 2)
      .forEach((item: AssessmentReportItem, idx: number) => {
        alerts.push({
          id: `alert-quiz-${idx}`,
          type: 'assessment',
          title: `Assessment Retry Required: ${item.employee_name}`,
          description: `Topic: ${item.module_title || item.assessment_topic} (Latest score: ${item.latest_score}%)`,
          severity: 'high',
          icon: Award,
          color: 'text-rose-400',
          bgColor: 'bg-rose-500/10',
        });
      });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <h3 className="font-semibold text-slate-100">Active Team Training Alerts</h3>
        </div>
        <span className="text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
          {alerts.length} Alerts Surface
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center">
          <Clock className="h-6 w-6 text-emerald-500/50 mb-2" />
          No active training alerts detected. All team members meet compliance benchmarks.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${alert.bgColor} shrink-0`}>
                    <Icon className={`h-4 w-4 ${alert.color}`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{alert.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{alert.description}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                      alert.severity === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <button
                    onClick={() => window.alert(`Alert details for: ${alert.title}`)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="View Alert"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
