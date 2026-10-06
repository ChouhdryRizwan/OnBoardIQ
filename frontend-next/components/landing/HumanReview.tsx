import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const HumanReview: React.FC = () => {
  const actions = [
    { label: 'Approve', icon: '✓', desc: 'Releases onboarding plan to active employee portal.' },
    { label: 'Reject', icon: '✕', desc: 'Sends plan back to Pipeline 1 with reviewer feedback.' },
    { label: 'Edit', icon: '✏️', desc: 'Allows direct content modification before release.' },
    { label: 'Regenerate', icon: '🔄', desc: 'Re-runs Pipeline 1 with updated prompt constraints.' },
    { label: 'Comment', icon: '💬', desc: 'Attaches inline compliance notes to plan audit logs.' },
    { label: 'Manual Override', icon: '🛡️', desc: 'Allows compliance officers to override edge cases.' },
  ];

  return (
    <section id="human-review" className="py-20 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="indigo" className="uppercase">
              Governance & Oversight
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              AI assists. Humans decide.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              No plan is released to employees without explicit human authorization. Compliance and HR managers retain full editing control and final approval authority backed by immutable audit trails.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {actions.map((act) => (
                <div key={act.label} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-100">
                    <span className="text-indigo-600 font-bold">{act.icon}</span>
                    {act.label}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{act.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Interactive Mock UI Review Queue Card */}
          <div className="lg:col-span-7">
            <Card className="border-slate-800 shadow-xl bg-slate-950/50 p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Human Review Queue Item #804</span>
                  <h3 className="text-lg font-bold text-slate-100">Senior Compliance Analyst Plan</h3>
                </div>
                <Badge variant="warning">Manual Review Required</Badge>
              </div>

              {/* Reviewer Scorecard Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-900 p-3 border border-slate-800 rounded-lg text-center">
                <div>
                  <span className="text-[11px] text-slate-400 block">Mandatory Rule Coverage</span>
                  <span className="text-base font-extrabold text-emerald-600">100%</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Source Traceability</span>
                  <span className="text-base font-extrabold text-indigo-600">100%</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Flagged Hallucinations</span>
                  <span className="text-base font-extrabold text-slate-100">0</span>
                </div>
              </div>

              {/* Line Item Review Preview */}
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>Module 1: ISO 27001 Data Protection SOP</span>
                    <Badge variant="success" className="text-[10px]">Verified ✓</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Cites <code className="bg-slate-800/60 text-slate-300 px-1 py-0.5 rounded">Security_Manual.pdf Sec 4.1</code></p>
                </div>

                <div className="p-3 bg-slate-900 border border-indigo-200 rounded-lg">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>Module 2: Key Management & Cryptographic Controls</span>
                    <Badge variant="indigo" className="text-[10px]">Human Edited ✏️</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Updated quiz pass threshold from 80% to 90% by Compliance Manager.</p>
                </div>
              </div>

              {/* Action Buttons Mockup */}
              <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  ✓ Approve Plan
                </Button>
                <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50">
                  ✕ Reject Plan
                </Button>
                <Button variant="outline" size="sm">
                  ✏️ Edit Content
                </Button>
                <Button variant="outline" size="sm">
                  🔄 Regenerate
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
