'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import { getStoredUser } from '@/lib/auth';
import { User } from '@/types';
import {
  fetchEmployeeLearningOverview,
  EmployeeLearningOverviewData,
  startModule,
  completeModule,
  completeChecklist,
  completePracticalTask,
} from '@/lib/services/employeeLearning';

import { EmployeeLearningHeader } from '@/components/employeeLearning/EmployeeLearningHeader';
import { EmployeePlanOverview } from '@/components/employeeLearning/EmployeePlanOverview';
import { EmployeeTrainingModules } from '@/components/dashboard/employee/EmployeeTrainingModules';
import { ModuleTaskList } from '@/components/employeeLearning/ModuleTaskList';
import { ModuleChecklistSection } from '@/components/employeeLearning/ModuleChecklistSection';
import { EmployeeAssessmentList } from '@/components/employeeLearning/EmployeeAssessmentList';
import { EmployeeWeakAreas } from '@/components/dashboard/employee/EmployeeWeakAreas';

import { BookOpen, Award, CheckSquare, ShieldCheck, Layers } from 'lucide-react';

export default function EmployeeLearningPage() {
  const router = useRouter();
  const [data, setData] = useState<EmployeeLearningOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [userProfile] = useState<User | null>(() => getStoredUser());
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'tasks' | 'checklists' | 'assessments'>('overview');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    const result = await fetchEmployeeLearningOverview();
    setData(result);
    setLastRefreshed(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      const result = await fetchEmployeeLearningOverview();
      if (isMounted) {
        setData(result);
        setLastRefreshed(new Date());
        setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartModule = async (moduleId: string) => {
    try {
      await startModule(moduleId);
      await loadOverview();
      router.push(`/employee/learning/module/${moduleId}`);
    } catch {
      router.push(`/employee/learning/module/${moduleId}`);
    }
  };

  const handleCompleteModule = async (moduleId: string) => {
    try {
      await completeModule(moduleId);
      await loadOverview();
    } catch {
      // Handled upstream
    }
  };

  const handleToggleChecklist = async (checklistId: string) => {
    try {
      await completeChecklist(checklistId);
      await loadOverview();
    } catch {
      // Handled upstream
    }
  };

  const handleCompleteTask = async (taskId: string, notes?: string, evidenceLink?: string) => {
    try {
      await completePracticalTask(taskId, notes, evidenceLink);
      await loadOverview();
    } catch {
      // Handled upstream
    }
  };

  return (
    <AppLayout allowedRoles={['admin', 'employee']}>
      <DashboardPageContainer>
        {/* Workspace Header */}
        <EmployeeLearningHeader
          employeeName={userProfile?.full_name}
          roleTitle={userProfile?.role}
          overallProgress={data?.progressSummary?.overall_progress_percentage || data?.plan?.overall_progress_percentage || 0}
          overallStatus={data?.progressSummary?.overall_status || data?.plan?.overall_status || 'On Track'}
          lastRefreshed={lastRefreshed || undefined}
          loading={loading}
          onRefresh={loadOverview}
        />

        {/* Workspace Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-6 bg-slate-900 rounded-xl p-1.5 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" /> Roadmap Overview
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'modules'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Assigned Modules ({data?.modules?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Practical Tasks ({data?.tasks?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('checklists')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'checklists'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Checklists ({data?.checklists?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'assessments'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" /> Quizzes & Assessments ({data?.assessments?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <EmployeePlanOverview
              plan={data?.plan || null}
              loading={loading}
              onStartModule={handleStartModule}
              onCompleteModule={handleCompleteModule}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModuleTaskList
                tasks={data?.tasks || []}
                loading={loading}
                error={data?.errors.tasks}
                onCompleteTask={handleCompleteTask}
              />

              <ModuleChecklistSection
                checklists={data?.checklists || []}
                loading={loading}
                onToggleChecklist={handleToggleChecklist}
              />
            </div>

            <EmployeeWeakAreas
              assessments={null}
              recommendations={data?.recommendations || []}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'modules' && (
          <EmployeeTrainingModules
            modules={data?.modules || []}
            loading={loading}
            error={data?.errors.modules}
            onRefreshNeeded={loadOverview}
          />
        )}

        {activeTab === 'tasks' && (
          <ModuleTaskList
            tasks={data?.tasks || []}
            loading={loading}
            error={data?.errors.tasks}
            onCompleteTask={handleCompleteTask}
          />
        )}

        {activeTab === 'checklists' && (
          <ModuleChecklistSection
            checklists={data?.checklists || []}
            loading={loading}
            onToggleChecklist={handleToggleChecklist}
          />
        )}

        {activeTab === 'assessments' && (
          <EmployeeAssessmentList
            assessments={data?.assessments || []}
            loading={loading}
          />
        )}
      </DashboardPageContainer>
    </AppLayout>
  );
}
