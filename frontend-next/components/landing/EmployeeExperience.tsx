import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const EmployeeExperience: React.FC = () => {
  const modules = [
    { id: 1, title: 'Company Security Policy & Passwords', status: 'Completed', score: '95%', badgeVariant: 'success' as const },
    { id: 2, title: 'Data Privacy & GDPR SOP Compliance', status: 'Completed', score: '90%', badgeVariant: 'success' as const },
    { id: 3, title: 'Incident Response & Threat Escalation', status: 'In Progress', score: 'Pending', badgeVariant: 'warning' as const },
    { id: 4, title: 'Role Specific Infrastructure Tooling', status: 'Locked', score: 'Prerequisite Required', badgeVariant: 'neutral' as const },
  ];

  return (
    <section id="employee-experience" className="py-20 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="emerald" className="mb-4">
            Module 6 — Student Experience
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Engaging, structured learning for employees
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Employees receive clear, role-specific onboarding schedules with interactive assessments, real-time score tracking, and automated weak-area feedback.
          </p>
        </div>

        {/* Realistic Employee Dashboard Mockup */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-800 shadow-xl bg-slate-900 p-6 sm:p-8">
            {/* Employee Welcome Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Employee Learning Portal</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1">Welcome back, Jordan Lee</h3>
                <p className="text-xs text-slate-400">Assigned Role: <span className="font-semibold text-slate-200">Cloud Operations Engineer</span></p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-400 block">Overall Onboarding</span>
                  <span className="text-base font-extrabold text-emerald-600">75% Completed</span>
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent flex items-center justify-center font-bold text-xs text-emerald-700">
                  3/4
                </div>
              </div>
            </div>

            {/* Learning Modules List */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Assigned Learning Modules</h4>
              {modules.map((m) => (
                <div key={m.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Module {m.id}</span>
                      <h5 className="text-sm font-bold text-slate-100">{m.title}</h5>
                    </div>
                    <span className="text-xs text-slate-400 mt-0.5 block">Assessment Status: {m.score}</span>
                  </div>
                  <Badge variant={m.badgeVariant}>{m.status}</Badge>
                </div>
              ))}
            </div>

            {/* Weak Areas & Targeted Recommendations Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <div className="text-amber-600 text-lg font-bold">💡</div>
              <div>
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Targeted Recommendation</h5>
                <p className="text-xs text-amber-800 mt-0.5">
                  Based on Quiz #2 results, review Section 4.1 of <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GDPR_Compliance_Manual.pdf</code> to improve data classification mastery.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
