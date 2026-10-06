'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '../../../components/dashboard/AppLayout';
import { DashboardPageContainer } from '../../../components/dashboard/DashboardPageContainer';
import { TrainingDashboardHeader } from '../../../components/dashboard/training/TrainingDashboardHeader';
import { TrainingKpiGrid } from '../../../components/dashboard/training/TrainingKpiGrid';
import { OnboardingProgress } from '../../../components/dashboard/training/OnboardingProgress';
import { EmployeeTrainingTable } from '../../../components/dashboard/training/EmployeeTrainingTable';
import { TrainingPlanOverview } from '../../../components/dashboard/training/TrainingPlanOverview';
import { MandatoryTraining } from '../../../components/dashboard/training/MandatoryTraining';
import { AssessmentOverview } from '../../../components/dashboard/training/AssessmentOverview';
import { LearningWeakAreas } from '../../../components/dashboard/training/LearningWeakAreas';
import { TrainingPolicyImpact } from '../../../components/dashboard/training/TrainingPolicyImpact';
import { TrainingReviewQueue } from '../../../components/dashboard/training/TrainingReviewQueue';
import { TrainingQuickActions } from '../../../components/dashboard/training/TrainingQuickActions';
import { TrainingReports } from '../../../components/dashboard/training/TrainingReports';
import { RecentTrainingActivity } from '../../../components/dashboard/training/RecentTrainingActivity';
import { TrainingHealth } from '../../../components/dashboard/training/TrainingHealth';
import {
  fetchTrainingDashboardData,
  TrainingDashboardData,
} from '../../../lib/services/trainingDashboard';

export default function TrainingManagerDashboardPage() {
  const [data, setData] = useState<TrainingDashboardData>({
    health: null,
    overview: null,
    progressReport: null,
    mandatoryTraining: [],
    assessments: null,
    policyUpdates: [],
    reviewQueue: [],
    documents: [],
    jobRoles: [],
    errors: {},
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [filters, setFilters] = useState<{
    search?: string;
    department?: string;
    status?: string;
  }>({});

  const loadData = useCallback(async (currentFilters?: { search?: string; department?: string; status?: string }) => {
    setLoading(true);
    try {
      const res = await fetchTrainingDashboardData(currentFilters);
      setData(res);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      console.error('Failed to load training dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const res = await fetchTrainingDashboardData(filters);
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

  const handleFilterChange = (newFilters: { search?: string; department?: string; status?: string }) => {
    setFilters(newFilters);
    loadData(newFilters);
  };

  const handleRefresh = () => {
    loadData(filters);
  };

  const employeeProgressItems = data.progressReport?.items || [];

  return (
    <AppLayout allowedRoles={['admin', 'training_manager', 'hr_manager']}>
      <DashboardPageContainer>
        {/* Header */}
        <TrainingDashboardHeader
          lastRefreshed={lastRefreshed}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* System & Health Status Indicator */}
        <TrainingHealth
          health={data.health}
          loading={loading}
          error={data.errors.health}
        />

        {/* Top-level KPI Grid */}
        <TrainingKpiGrid
          overview={data.overview}
          loading={loading}
          error={data.errors.overview}
        />

        {/* Main 2-column layout: Onboarding Status Breakdown + Configured RRM Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OnboardingProgress
            items={employeeProgressItems}
            loading={loading}
            error={data.errors.progressReport}
          />
          <TrainingPlanOverview
            jobRoles={data.jobRoles}
            loading={loading}
            error={data.errors.jobRoles}
          />
        </div>

        {/* Primary Data Table: Employee Training & Onboarding Progress */}
        <EmployeeTrainingTable
          items={employeeProgressItems}
          loading={loading}
          error={data.errors.progressReport}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
        />

        {/* Middle Section: Mandatory Compliance + Assessment Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MandatoryTraining
            items={data.mandatoryTraining}
            loading={loading}
            error={data.errors.mandatoryTraining}
          />
          <AssessmentOverview
            assessments={data.assessments}
            loading={loading}
            error={data.errors.assessments}
          />
        </div>

        {/* Secondary Section: Learning Weak Areas + Policy Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LearningWeakAreas
            assessments={data.assessments}
            progressItems={employeeProgressItems}
            loading={loading}
            error={data.errors.assessments}
          />
          <TrainingPolicyImpact
            policyUpdates={data.policyUpdates}
            loading={loading}
            error={data.errors.policyUpdates}
          />
        </div>

        {/* Human Review Queue + Activity Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrainingReviewQueue
            reviewQueue={data.reviewQueue}
            loading={loading}
            error={data.errors.reviewQueue}
          />
          <RecentTrainingActivity
            progressItems={employeeProgressItems}
            reviewQueue={data.reviewQueue}
            policyUpdates={data.policyUpdates}
            loading={loading}
          />
        </div>

        {/* Quick Actions Shortcuts */}
        <TrainingQuickActions />

        {/* Exportable Reports Section */}
        <TrainingReports />
      </DashboardPageContainer>
    </AppLayout>
  );
}
