'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import { getStoredUser } from '@/lib/auth';
import { User } from '@/types';
import { fetchEmployeeDashboardData, EmployeeDashboardData } from '@/lib/services/employeeDashboard';

// Employee Dashboard Modular Components
import { EmployeeDashboardHeader } from '@/components/dashboard/employee/EmployeeDashboardHeader';
import { EmployeeProfileSummary } from '@/components/dashboard/employee/EmployeeProfileSummary';
import { EmployeeLearningHealth } from '@/components/dashboard/employee/EmployeeLearningHealth';
import { EmployeeKpiGrid } from '@/components/dashboard/employee/EmployeeKpiGrid';
import { ContinueLearning } from '@/components/dashboard/employee/ContinueLearning';
import { EmployeeOnboardingProgress } from '@/components/dashboard/employee/EmployeeOnboardingProgress';
import { CurrentTrainingPlan } from '@/components/dashboard/employee/CurrentTrainingPlan';
import { EmployeeTrainingModules } from '@/components/dashboard/employee/EmployeeTrainingModules';
import { EmployeeMandatoryTraining } from '@/components/dashboard/employee/EmployeeMandatoryTraining';
import { EmployeeAssessmentOverview } from '@/components/dashboard/employee/EmployeeAssessmentOverview';
import { EmployeeWeakAreas } from '@/components/dashboard/employee/EmployeeWeakAreas';
import { EmployeeActionItems } from '@/components/dashboard/employee/EmployeeActionItems';
import { EmployeePolicyUpdates } from '@/components/dashboard/employee/EmployeePolicyUpdates';
import { RecentLearningActivity } from '@/components/dashboard/employee/RecentLearningActivity';
import { EmployeeQuickActions } from '@/components/dashboard/employee/EmployeeQuickActions';

export default function EmployeeDashboardPage() {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [userProfile] = useState<User | null>(() => getStoredUser());

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    const result = await fetchEmployeeDashboardData();
    setData(result);
    setLastRefreshed(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      const result = await fetchEmployeeDashboardData();
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

  return (
    <AppLayout allowedRoles={['admin', 'employee']}>
      <DashboardPageContainer>
        {/* Header */}
        <EmployeeDashboardHeader
          employeeName={userProfile?.full_name || data?.dashboard?.employee_name}
          roleTitle={userProfile?.role}
          lastRefreshed={lastRefreshed || undefined}
          loading={loading}
          onRefresh={loadDashboardData}
        />

        {/* Top Profile Summary & Health Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmployeeProfileSummary
              dashboard={data?.dashboard || null}
              loading={loading}
            />
          </div>
          <div>
            <EmployeeLearningHealth
              health={data?.health || null}
              dashboard={data?.dashboard || null}
              modules={data?.modules || []}
              loading={loading}
              error={data?.errors.health}
            />
          </div>
        </div>

        {/* 8 Personal KPIs */}
        <EmployeeKpiGrid
          dashboard={data?.dashboard || null}
          learningPlan={data?.learningPlan || null}
          modules={data?.modules || []}
          mandatoryItems={data?.mandatoryTraining || []}
          assessments={data?.assessments || null}
          loading={loading}
        />

        {/* Continue Learning CTA Hero */}
        <ContinueLearning
          dashboard={data?.dashboard || null}
          modules={data?.modules || []}
          onRefreshNeeded={loadDashboardData}
        />

        {/* Main Onboarding Progress & Current Training Plan Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmployeeOnboardingProgress
            dashboard={data?.dashboard || null}
            loading={loading}
            error={data?.errors.dashboard}
          />
          <CurrentTrainingPlan
            plan={data?.learningPlan || null}
            loading={loading}
            error={data?.errors.learningPlan}
          />
        </div>

        {/* My Assigned Modules List/Table */}
        <EmployeeTrainingModules
          modules={data?.modules || []}
          loading={loading}
          error={data?.errors.modules}
          onRefreshNeeded={loadDashboardData}
        />

        {/* Mandatory Policy Training Requirements */}
        <EmployeeMandatoryTraining
          mandatoryItems={data?.mandatoryTraining || []}
          loading={loading}
          error={data?.errors.mandatoryTraining}
          employeeName={userProfile?.full_name || data?.dashboard?.employee_name}
        />

        {/* Quiz Assessments & Recommended Focus Areas Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmployeeAssessmentOverview
            assessments={data?.assessments || null}
            loading={loading}
            error={data?.errors.assessments}
            employeeName={userProfile?.full_name || data?.dashboard?.employee_name}
          />
          <EmployeeWeakAreas
            assessments={data?.assessments || null}
            recommendations={data?.dashboard?.recommendations || []}
            loading={loading}
          />
        </div>

        {/* Action Items & Policy Updates Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmployeeActionItems
            upcomingActivities={data?.dashboard?.upcoming_activities || []}
            pendingModulesCount={data?.dashboard?.pending_modules_count || 0}
            loading={loading}
          />
          <EmployeePolicyUpdates
            policyUpdates={data?.policyUpdates || []}
            loading={loading}
          />
        </div>

        {/* Recent Activity Log & Quick Workspace Shortcuts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentLearningActivity
              dashboard={data?.dashboard || null}
              modules={data?.modules || []}
              assessments={data?.assessments || null}
              loading={loading}
            />
          </div>
          <div>
            <EmployeeQuickActions />
          </div>
        </div>
      </DashboardPageContainer>
    </AppLayout>
  );
}
