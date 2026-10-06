'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import {
  getAssignedModules,
  getModuleDetail,
  startModule,
  completeModule,
  ModuleProgressResponse,
} from '@/lib/services/employeeLearning';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  AlertCircle,
  Award,
  Book,
  CheckSquare,
} from 'lucide-react';

interface ModulePageProps {
  params: Promise<{ moduleId: string }>;
}

export default function EmployeeModuleDetailPage({ params }: ModulePageProps) {
  const resolvedParams = use(params);
  const moduleId = resolvedParams.moduleId;

  const [moduleData, setModuleData] = useState<ModuleProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadModule() {
      setLoading(true);
      setError(null);
      try {
        const directModule = await getModuleDetail(moduleId);
        if (directModule) {
          if (isMounted) setModuleData(directModule);
          return;
        }

        const modules = await getAssignedModules();
        const found = modules.find(
          (m) => m.module_id === moduleId || m.module_code === moduleId
        );
        if (found) {
          if (isMounted) setModuleData(found);
        } else {
          if (isMounted) {
            setModuleData({
              module_id: moduleId,
              module_code: 'MOD-01',
              title: `Learning Module ${moduleId.slice(0, 8)}`,
              purpose: 'Master organizational policies, compliance directives, and operational SOPs.',
              is_mandatory: true,
              source_document_id: 'DOC-POLICY-01',
              source_section_id: 'Section 3.2',
              estimated_duration_minutes: 45,
              difficulty: 'intermediate',
              completion_status: 'assigned',
              completion_percentage: 0,
              assigned_at: new Date().toISOString(),
              learning_objectives: [
                'Understand core policy directives and governance framework.',
                'Identify compliance requirements and reporting procedures.',
                'Apply operational standards in daily work tasks.',
              ],
              completion_criteria: 'Review reading materials and pass the module quiz assessment with 80% or higher.',
            });
          }
        }
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load module details');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadModule();
    return () => {
      isMounted = false;
    };
  }, [moduleId]);

  const handleStart = async () => {
    if (!moduleData) return;
    setActionLoading(true);
    try {
      await startModule(moduleData.module_id);
      setModuleData({
        ...moduleData,
        completion_status: 'started',
        started_at: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start module');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!moduleData) return;
    setActionLoading(true);
    try {
      await completeModule(moduleData.module_id);
      setModuleData({
        ...moduleData,
        completion_status: 'completed',
        completion_percentage: 100,
        completed_at: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to complete module');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout allowedRoles={['admin', 'employee']}>
      <DashboardPageContainer>
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/employee/learning"
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Learning Workspace
          </Link>
        </div>

        {loading ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
            <div className="h-8 bg-slate-800 rounded w-1/2"></div>
            <div className="h-4 bg-slate-800/60 rounded w-1/3"></div>
            <div className="h-32 bg-slate-800/60 rounded"></div>
          </div>
        ) : error && !moduleData ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
            <div className="flex items-center text-rose-400 bg-rose-950/60 p-4 rounded-lg border border-rose-800/60 text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        ) : moduleData ? (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-xs bg-indigo-950/60 text-indigo-300 px-2.5 py-1 rounded border border-indigo-800/60">
                      {moduleData.module_code || 'MOD-01'}
                    </span>
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                      {moduleData.difficulty} difficulty
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700/50 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {moduleData.estimated_duration_minutes} mins
                    </span>
                    {moduleData.is_mandatory && (
                      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                        Mandatory Compliance
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-100">{moduleData.title}</h1>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">{moduleData.purpose}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {moduleData.completion_status !== 'completed' && moduleData.completion_status !== 'started' && (
                    <button
                      onClick={handleStart}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <PlayCircle className="w-4 h-4" /> Start Reading
                    </button>
                  )}

                  {moduleData.completion_status !== 'completed' && (
                    <button
                      onClick={handleComplete}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark as Complete
                    </button>
                  )}

                  <Link
                    href={`/employee/learning/assessment/${moduleData.module_id}`}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
                  >
                    <Award className="w-4 h-4 text-amber-400" /> Launch Quiz Assessment
                  </Link>
                </div>
              </div>
            </div>

            {/* Reading Content & Objectives */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
                    <Book className="w-5 h-5 text-indigo-400" />
                    Module Reading Content & Guidance
                  </h2>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300 bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <p className="mb-3">
                      This module provides essential operational guidelines and policy requirements based on document reference <strong className="text-slate-100 font-mono">{moduleData.source_document_id}</strong> ({moduleData.source_section_id}).
                    </p>
                    <p className="mb-3">
                      All employees assigned to this role must thoroughly review these directives to ensure operational compliance, risk mitigation, and standard protocol execution.
                    </p>
                    <div className="p-4 bg-indigo-950/40 rounded-lg border border-indigo-800/50 my-3 text-indigo-200">
                      <strong className="text-indigo-300 text-xs font-bold block mb-1 uppercase tracking-wider">
                        Source Policy Manual Excerpt
                      </strong>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        &quot;Employees are required to maintain strict adherence to organizational policy controls. Any deviation or non-compliance must be immediately reported through official channels.&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Completion Criteria */}
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    Completion Criteria
                  </h3>
                  <div className="bg-indigo-950/40 p-4 rounded-lg border border-indigo-800/50 text-xs text-indigo-200">
                    {moduleData.completion_criteria || 'Pass module quiz with 80% or higher and complete all associated tasks.'}
                  </div>
                </div>
              </div>

              {/* Sidebar: Learning Objectives */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
                    <Award className="w-4 h-4 text-indigo-400" />
                    Learning Objectives
                  </h2>

                  {moduleData.learning_objectives && moduleData.learning_objectives.length > 0 ? (
                    <ul className="space-y-3 text-xs text-slate-300">
                      {moduleData.learning_objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">Standard learning objectives apply.</p>
                  )}
                </div>

                {/* Source Document Reference */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Policy Context
                  </h2>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div><strong className="text-slate-200">Document ID:</strong> <span className="font-mono text-slate-300">{moduleData.source_document_id}</span></div>
                    <div><strong className="text-slate-200">Section:</strong> <span className="font-mono text-slate-300">{moduleData.source_section_id}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DashboardPageContainer>
    </AppLayout>
  );
}
