'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../../components/dashboard/AppLayout';
import { DashboardPageContainer } from '../../../components/dashboard/DashboardPageContainer';
import { AdminDashboardHeader } from '../../../components/dashboard/admin/AdminDashboardHeader';
import { AdminKpiGrid } from '../../../components/dashboard/admin/AdminKpiGrid';
import { EmployeeOverview } from '../../../components/dashboard/admin/EmployeeOverview';
import { OnboardingOverview } from '../../../components/dashboard/admin/OnboardingOverview';
import { ValidationHealth } from '../../../components/dashboard/admin/ValidationHealth';
import { ReviewQueueSection } from '../../../components/dashboard/admin/ReviewQueueSection';
import { KnowledgeOverview } from '../../../components/dashboard/admin/KnowledgeOverview';
import { RRMOverview } from '../../../components/dashboard/admin/RRMOverview';
import { PolicyUpdateOverview } from '../../../components/dashboard/admin/PolicyUpdateOverview';
import { LearningOverview } from '../../../components/dashboard/admin/LearningOverview';
import { ReportsQuickAccess } from '../../../components/dashboard/admin/ReportsQuickAccess';
import { RecentActivity } from '../../../components/dashboard/admin/RecentActivity';
import { SystemHealthWidget } from '../../../components/dashboard/admin/SystemHealthWidget';
import { AdminQuickActions } from '../../../components/dashboard/admin/AdminQuickActions';
import { fetchAdminDashboardData, AdminDashboardData } from '../../../lib/services/adminDashboard';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData>({
    health: null,
    overview: null,
    employees: [],
    documents: [],
    jobRoles: [],
    rrmSummary: null,
    reviewQueue: [],
    policyUpdates: [],
    errors: {},
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchAdminDashboardData();
      setData(result);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch {
      // Widget level handling
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function initDashboard() {
      try {
        const result = await fetchAdminDashboardData();
        if (isMounted) {
          setData(result);
          setLastRefreshedAt(new Date().toLocaleTimeString());
        }
      } catch {
        // Widget level handling
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    initDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppLayout allowedRoles={['admin']}>
      <DashboardPageContainer>
        {/* 1. Header with Refresh Action & Role Badge */}
        <AdminDashboardHeader
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          lastRefreshedAt={lastRefreshedAt}
        />

        {/* 2. Top Operational KPI Grid */}
        <AdminKpiGrid data={data} isLoading={isLoading} />

        {/* 3. Quick Actions Shortcuts */}
        <AdminQuickActions />

        {/* 4. Employee & Onboarding Lifecycle Overviews */}
        <div className="grid lg:grid-cols-2 gap-6">
          <EmployeeOverview data={data} isLoading={isLoading} />
          <OnboardingOverview data={data} isLoading={isLoading} />
        </div>

        {/* 5. Validation Health & Pipeline 1 vs 2 Engine Showcase */}
        <ValidationHealth data={data} isLoading={isLoading} />

        {/* 6. Human Review Queue Section */}
        <ReviewQueueSection data={data} isLoading={isLoading} />

        {/* 7. Document Knowledge & RRM Overviews */}
        <div className="grid lg:grid-cols-2 gap-6">
          <KnowledgeOverview data={data} isLoading={isLoading} />
          <RRMOverview data={data} isLoading={isLoading} />
        </div>

        {/* 8. Policy Update & Employee Learning Progress Overviews */}
        <div className="grid lg:grid-cols-2 gap-6">
          <PolicyUpdateOverview data={data} isLoading={isLoading} />
          <LearningOverview data={data} isLoading={isLoading} />
        </div>

        {/* 9. Reports & Analytics Quick Access Grid */}
        <ReportsQuickAccess />

        {/* 10. System Activity Log & System Health Widget */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivity data={data} isLoading={isLoading} />
          <SystemHealthWidget data={data} isLoading={isLoading} />
        </div>
      </DashboardPageContainer>
    </AppLayout>
  );
}
