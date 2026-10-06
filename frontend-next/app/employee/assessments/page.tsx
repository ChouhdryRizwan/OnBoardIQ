'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import { getStoredUser } from '@/lib/auth';
import { User } from '@/types';
import {
  fetchEmployeeLearningOverview,
  EmployeeLearningOverviewData,
} from '@/lib/services/employeeLearning';

import { EmployeeLearningHeader } from '@/components/employeeLearning/EmployeeLearningHeader';
import { EmployeeAssessmentList } from '@/components/employeeLearning/EmployeeAssessmentList';
import { EmployeeWeakAreas } from '@/components/dashboard/employee/EmployeeWeakAreas';

export default function EmployeeAssessmentsPage() {
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

  return (
    <AppLayout allowedRoles={['admin', 'employee']}>
      <DashboardPageContainer>
        <EmployeeLearningHeader
          employeeName={userProfile?.full_name}
          roleTitle={userProfile?.role}
          overallProgress={data?.progressSummary?.overall_progress_percentage || 0}
          overallStatus={data?.progressSummary?.overall_status || 'On Track'}
          lastRefreshed={lastRefreshed || undefined}
          loading={loading}
          onRefresh={loadData}
        />

        <div className="space-y-6">
          <EmployeeAssessmentList
            assessments={data?.assessments || []}
            loading={loading}
          />

          <EmployeeWeakAreas
            assessments={null}
            recommendations={data?.recommendations || []}
            loading={loading}
          />
        </div>
      </DashboardPageContainer>
    </AppLayout>
  );
}
