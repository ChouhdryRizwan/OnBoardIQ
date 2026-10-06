'use client';

import React, { useState } from 'react';
import { ReviewItemDetails } from '@/lib/services/humanReview';
import { BookOpen, AlertOctagon, Scale, Clock, Award, HelpCircle, FileCode, CheckCircle2, XCircle } from 'lucide-react';

interface ReviewDetailPanelProps {
  details: ReviewItemDetails | null;
  loading: boolean;
}

export function ReviewDetailPanel({ details, loading }: ReviewDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'plan' | 'issues' | 'comparison' | 'audit'>('plan');

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-20 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="bg-slate-900 rounded-xl border border-dashed border-slate-700 p-8 shadow-sm mb-6 text-center text-slate-400 text-xs">
        Select a review queue item from the table above to inspect plan details and validation findings.
      </div>
    );
  }

  const { plan_details, validation_issues, hallucination_flags, contradiction_flags } = details;
  const stages = plan_details.stages || [];
  const auditTrail = plan_details.audit_trail || [];

  const isApproved =
    plan_details.final_approval_status?.toLowerCase() === 'approved' ||
    plan_details.final_approval_status?.toLowerCase() === 'finalized' ||
    details.review_queue_item?.status?.toLowerCase() === 'approved';

  const isRejected =
    plan_details.final_approval_status?.toLowerCase() === 'rejected' ||
    details.review_queue_item?.status?.toLowerCase() === 'rejected';

  const isVerified =
    plan_details.verification_status?.toLowerCase() === 'verified' ||
    plan_details.verification_status?.toLowerCase() === 'verified_with_warning';

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden mb-6">
      {/* Top Banner */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2.5 py-0.5 rounded">
              Plan ID: {plan_details.plan_id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${
                isApproved
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : isRejected
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  : 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
              }`}
            >
              {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              {isRejected && <XCircle className="w-3 h-3 text-rose-400" />}
              {plan_details.final_approval_status}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                isVerified
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : isRejected
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
              }`}
            >
              {plan_details.verification_status}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-100 mt-1">
            {plan_details.role_title} ({plan_details.role_code}) — {plan_details.employee_name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Department: {plan_details.department} • Mandatory Coverage: <span className="font-bold text-emerald-400 font-mono">{plan_details.mandatory_coverage_score}%</span> • Traceability: <span className="font-bold text-indigo-400 font-mono">{plan_details.source_traceability_score}%</span>
          </p>
        </div>

        {/* Tab Selection Controls */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'plan' ? 'bg-slate-800 text-purple-400 border border-purple-500/40 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Plan Structure
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'issues' ? 'bg-slate-800 text-purple-400 border border-purple-500/40 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" /> Issues ({validation_issues.length + hallucination_flags.length + contradiction_flags.length})
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'comparison' ? 'bg-slate-800 text-purple-400 border border-purple-500/40 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> 3-Layer Alignment
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-slate-800 text-purple-400 border border-purple-500/40 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Audit Trail ({auditTrail.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PLAN STRUCTURE */}
      {activeTab === 'plan' && (
        <div className="p-6 space-y-6">
          {stages.map((stg: Record<string, unknown>, sIdx: number) => {
            const modules = (stg.modules as Record<string, unknown>[]) || [];

            return (
              <div key={(stg.stage_id as string) || sIdx} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">
                    Stage {(stg.stage_order as number) || sIdx + 1}: {stg.stage_name as string}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">{modules.length} Module(s)</span>
                </div>

                <div className="p-4 space-y-4">
                  {modules.map((mod) => {
                    const tasks = (mod.tasks as Record<string, unknown>[]) || [];
                    const quizzes = (mod.quizzes as Record<string, unknown>[]) || [];

                    return (
                      <div key={mod.module_id as string} className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                                {mod.module_code as string}
                              </span>
                              {Boolean(mod.is_mandatory) && (
                                <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded">
                                  Mandatory
                                </span>
                              )}
                              <span className="px-2 py-0.5 text-[10px] capitalize font-medium bg-slate-800 text-slate-300 border border-slate-700/50 rounded">
                                {mod.difficulty as string}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-slate-100">{mod.title as string}</h4>
                            {Boolean(mod.purpose) && <p className="text-xs text-slate-400 mt-0.5">{mod.purpose as string}</p>}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                          <span className="flex items-center gap-1 text-slate-300 font-semibold">
                            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                            Doc: {mod.source_document_id as string} (Sec {mod.source_section_id as string})
                          </span>
                          <span>•</span>
                          <span>Requirement: {mod.requirement_id as string}</span>
                        </div>

                        {/* Practical Tasks */}
                        {tasks.length > 0 && (
                          <div className="space-y-2 pt-2 text-xs">
                            <h5 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-purple-400" /> Tasks ({tasks.length})
                            </h5>
                            {tasks.map((t) => (
                              <div key={t.task_id as string} className="p-2.5 rounded bg-slate-950 border border-slate-800">
                                <div className="font-bold text-slate-100">{t.description as string}</div>
                                <div className="text-slate-400 text-[11px] mt-0.5">Outcome: {t.expected_outcome as string}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quiz Questions */}
                        {quizzes.length > 0 && (
                          <div className="space-y-2 pt-2 text-xs">
                            <h5 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5 text-sky-400" /> Assessments ({quizzes.length})
                            </h5>
                            {quizzes.map((q) => (
                              <div key={q.quiz_id as string} className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                                <div className="font-bold text-slate-100">{q.question_text as string}</div>
                                <div className="text-emerald-400 font-semibold text-[11px]">
                                  Answer: {q.correct_answer as string}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: VALIDATION ISSUES & FLAGS */}
      {activeTab === 'issues' && (
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Pipeline 2 Flags & Validation Findings</h3>
          
          {hallucination_flags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase">Unsupported / Hallucinated Citation Flags</h4>
              {hallucination_flags.map((h, i) => (
                <div key={h.flag_id || i} className="p-3 rounded-lg border border-amber-800/50 bg-amber-950/40 text-xs">
                  <div className="font-bold text-amber-300">{h.flagged_statement}</div>
                  <div className="text-slate-400 mt-0.5">Claimed Document: {h.claimed_source_doc}</div>
                  {h.reason && <div className="text-slate-400 italic mt-0.5">Reason: {h.reason}</div>}
                </div>
              ))}
            </div>
          )}

          {contradiction_flags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-300 uppercase">Policy Contradiction Flags</h4>
              {contradiction_flags.map((c, i) => (
                <div key={c.contradiction_id || i} className="p-3 rounded-lg border border-rose-800/50 bg-rose-950/40 text-xs space-y-1">
                  <div className="font-bold text-rose-300">Conflict: {c.primary_document_id} vs {c.conflicting_document_id}</div>
                  <div className="text-slate-300">Primary Clause: {c.primary_clause}</div>
                  <div className="text-slate-300">Conflicting Clause: {c.conflicting_clause}</div>
                </div>
              ))}
            </div>
          )}

          {validation_issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase">General Validation Issues</h4>
              {validation_issues.map((iss) => (
                <div key={iss.issue_id} className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-xs space-y-1">
                  <div className="font-bold text-indigo-300 flex items-center justify-between">
                    <span>{iss.issue_type}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
                      {iss.severity}
                    </span>
                  </div>
                  <div className="text-slate-200">{iss.explanation}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: THREE-LAYER ALIGNMENT */}
      {activeTab === 'comparison' && (
        <div className="p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-100">3-Layer Alignment: Ground Truth → GenAI → Python Engine</h3>
          <p className="text-slate-400">
            Verifies end-to-end alignment between approved policy PDF clauses, Gemini generated modules, and Python deterministic verification logic.
          </p>
          <div className="p-4 rounded-xl border border-purple-800/60 bg-purple-950/40 text-purple-200 font-mono space-y-2">
            <div>Employee ID: {plan_details.employee_id}</div>
            <div>Job Role: {plan_details.role_title} ({plan_details.role_code})</div>
            <div>Validation Report ID: {plan_details.validation_report_id || 'REP-LATEST'}</div>
            <div>Audit Status: {plan_details.verification_status}</div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-100">Reviewer Governance Audit Trail</h3>
          {auditTrail.length === 0 ? (
            <div className="text-xs text-slate-400">No review audit events logged yet.</div>
          ) : (
            <div className="space-y-2">
              {auditTrail.map((item) => (
                <div key={item.audit_id} className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-purple-400 uppercase font-mono">{item.action_taken}</span>
                    <span className="text-slate-400 font-normal">{new Date(item.performed_at).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-200">Reviewer: {item.reviewer_id}</div>
                  <div className="text-slate-400 italic">&ldquo;{item.reviewer_comments}&rdquo;</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
