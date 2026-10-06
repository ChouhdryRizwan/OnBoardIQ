'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '../../../components/dashboard/AppLayout';
import { DashboardPageContainer } from '../../../components/dashboard/DashboardPageContainer';
import { ManagerDashboardHeader } from '../../../components/dashboard/manager/ManagerDashboardHeader';
import { ManagerHealth } from '../../../components/dashboard/manager/ManagerHealth';
import { ManagerKpiGrid } from '../../../components/dashboard/manager/ManagerKpiGrid';
import { TeamOnboardingProgress } from '../../../components/dashboard/manager/TeamOnboardingProgress';
import { TeamTrainingTable } from '../../../components/dashboard/manager/TeamTrainingTable';
import { EmployeesNeedingAttention } from '../../../components/dashboard/manager/EmployeesNeedingAttention';
import { ManagerMandatoryTraining } from '../../../components/dashboard/manager/ManagerMandatoryTraining';
import { ManagerAssessmentOverview } from '../../../components/dashboard/manager/ManagerAssessmentOverview';
import { TeamTrainingProgress } from '../../../components/dashboard/manager/TeamTrainingProgress';
import { ManagerPolicyImpact } from '../../../components/dashboard/manager/ManagerPolicyImpact';
import { TrainingAlerts } from '../../../components/dashboard/manager/TrainingAlerts';
import { RecentTeamActivity } from '../../../components/dashboard/manager/RecentTeamActivity';
import { ManagerQuickActions } from '../../../components/dashboard/manager/ManagerQuickActions';
import { ManagerReports } from '../../../components/dashboard/manager/ManagerReports';
import {
  fetchManagerDashboardData,
  ManagerDashboardData,
} from '../../../lib/services/managerDashboard';

export default function ManagerDashboardPage() {
  const [data, setData] = useState<ManagerDashboardData>({
    health: null,
    overview: null,
    progressReport: null,
    mandatoryTraining: [],
    assessments: null,
    policyUpdates: [],
    reviewQueue: [],
    employees: [],
    jobRoles: [],
    errors: {},
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [filters, setFilters] = useState<{
    department?: string;
    roleCode?: string;
    status?: string;
    search?: string;
  }>({});

  const loadData = useCallback(async (currentFilters?: { department?: string; roleCode?: string; status?: string; search?: string }) => {
    setLoading(true);
    try {
      const res = await fetchManagerDashboardData(currentFilters);
      setData(res);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      console.error('Failed to load manager dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const res = await fetchManagerDashboardData(filters);
      if (isMounted) {
        setData(res);
        setLastRefreshed(new Date());
        setLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [filters]);

  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept);
    const newFilters = { ...filters, department: dept || undefined };
    setFilters(newFilters);
    loadData(newFilters);
  };

  const handleFilterChange = (newFilters: { search?: string; department?: string; status?: string; roleCode?: string }) => {
    setFilters(newFilters);
    loadData(newFilters);
  };

  const handleRefresh = () => {
    loadData(filters);
  };

  const progressItems = data.progressReport?.items || [];
  const departments = Array.from(
    new Set([
      ...data.jobRoles.map((r) => r.department),
      ...progressItems.map((p) => p.department),
      ...data.employees.map((e) => e.department),
    ].filter(Boolean))
  );

  return (
    <AppLayout allowedRoles={['admin', 'manager']}>
      <DashboardPageContainer>
        {/* Header */}
        <ManagerDashboardHeader
          lastRefreshed={lastRefreshed}
          onRefresh={handleRefresh}
          loading={loading}
          selectedDept={selectedDept}
          onDeptChange={handleDeptChange}
          departments={departments}
        />

        {/* System & Team Health Status Indicator */}
        <ManagerHealth
          health={data.health}
          progressItems={progressItems}
          assessments={data.assessments}
          loading={loading}
          error={data.errors.health}
        />

        {/* Top-level Manager KPI Grid */}
        <ManagerKpiGrid
          overview={data.overview}
          progressItems={progressItems}
          mandatoryItems={data.mandatoryTraining}
          assessments={data.assessments}
          loading={loading}
          error={data.errors.overview}
        />

        {/* Main 2-column layout: Team Onboarding Status + Team Training Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamOnboardingProgress
            items={progressItems}
            loading={loading}
            error={data.errors.progressReport}
          />
          <TeamTrainingProgress
            overview={data.overview}
            items={progressItems}
            loading={loading}
            error={data.errors.progressReport}
          />
        </div>

        {/* Primary Data Table: Team Training & Onboarding Status */}
        <TeamTrainingTable
          items={progressItems}
          loading={loading}
          error={data.errors.progressReport}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
        />

        {/* Middle Section: Employees Needing Attention + Active Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmployeesNeedingAttention
            items={progressItems}
            loading={loading}
            error={data.errors.progressReport}
          />
          <TrainingAlerts
            progressItems={progressItems}
            mandatoryItems={data.mandatoryTraining}
            assessments={data.assessments}
            loading={loading}
          />
        </div>

        {/* Mandatory Training + Assessment Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ManagerMandatoryTraining
            items={data.mandatoryTraining}
            loading={loading}
            error={data.errors.mandatoryTraining}
          />
          <ManagerAssessmentOverview
            assessments={data.assessments}
            loading={loading}
            error={data.errors.assessments}
          />
        </div>

        {/* Policy Impact + Recent Team Activity Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ManagerPolicyImpact
            policyUpdates={data.policyUpdates}
            loading={loading}
            error={data.errors.policyUpdates}
          />
          <RecentTeamActivity
            progressItems={progressItems}
            assessments={data.assessments}
            policyUpdates={data.policyUpdates}
            loading={loading}
          />
        </div>

        {/* Quick Actions Shortcuts */}
        <ManagerQuickActions />

        {/* Exportable Team Reports */}
        <ManagerReports />
      </DashboardPageContainer>
    </AppLayout>
  );
}
