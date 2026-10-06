'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import { getStoredUser } from '@/lib/auth';
import { User } from '@/types';
import {
  fetchEmployeeLearningOverview,
  EmployeeLearningOverviewData,
  startModule,
  completeModule,
} from '@/lib/services/employeeLearning';

import { EmployeeLearningHeader } from '@/components/employeeLearning/EmployeeLearningHeader';
import { EmployeePlanOverview } from '@/components/employeeLearning/EmployeePlanOverview';

export default function EmployeeOnboardingPage() {
  const [data, setData] = useState<EmployeeLearningOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [userProfile] = useState<User | null>(() => getStoredUser());

  const loadData = useCallback(async () => {
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
      await loadData();
    } catch {
      // Handled upstream
    }
  };

  const handleCompleteModule = async (moduleId: string) => {
    try {
      await completeModule(moduleId);
      await loadData();
    } catch {
      // Handled upstream
    }
  };

  return (
    <AppLayout allowedRoles={['admin', 'employee']}>
      <DashboardPageContainer>
        <EmployeeLearningHeader
          employeeName={userProfile?.full_name}
          roleTitle={userProfile?.role}
          overallProgress={data?.plan?.overall_progress_percentage || 0}
          overallStatus={data?.plan?.overall_status || 'On Track'}
          lastRefreshed={lastRefreshed || undefined}
          loading={loading}
          onRefresh={loadData}
        />

        <div className="space-y-6">
          <EmployeePlanOverview
            plan={data?.plan || null}
            loading={loading}
            onStartModule={handleStartModule}
            onCompleteModule={handleCompleteModule}
          />
        </div>
      </DashboardPageContainer>
    </AppLayout>
  );
}
