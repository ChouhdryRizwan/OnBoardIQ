'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '../../../components/dashboard/AppLayout';
import { DashboardPageContainer } from '../../../components/dashboard/DashboardPageContainer';
import { ReviewerDashboardHeader } from '../../../components/dashboard/reviewer/ReviewerDashboardHeader';
import { ReviewerKpiGrid } from '../../../components/dashboard/reviewer/ReviewerKpiGrid';
import { ReviewQueue } from '../../../components/dashboard/reviewer/ReviewQueue';
import { ValidationHealth } from '../../../components/dashboard/reviewer/ValidationHealth';
import { TraceabilityOverview } from '../../../components/dashboard/reviewer/TraceabilityOverview';
import { ValidationIssues } from '../../../components/dashboard/reviewer/ValidationIssues';
import { ReviewerDecisionSummary } from '../../../components/dashboard/reviewer/ReviewerDecisionSummary';
import { RecentReviewActivity } from '../../../components/dashboard/reviewer/RecentReviewActivity';
import { GenAIValidationComparison } from '../../../components/dashboard/reviewer/GenAIValidationComparison';
import { ReviewerPolicyImpact } from '../../../components/dashboard/reviewer/ReviewerPolicyImpact';
import { PriorityReviewItems } from '../../../components/dashboard/reviewer/PriorityReviewItems';
import { ReviewerQuickActions } from '../../../components/dashboard/reviewer/ReviewerQuickActions';
import { ReviewerReports } from '../../../components/dashboard/reviewer/ReviewerReports';
import { ReviewHealth } from '../../../components/dashboard/reviewer/ReviewHealth';
import {
  fetchReviewerDashboardData,
  ReviewerDashboardData,
} from '../../../lib/services/reviewerDashboard';

export default function ReviewerDashboardPage() {
  const [data, setData] = useState<ReviewerDashboardData>({
    health: null,
    overview: null,
    reviewQueue: [],
    comparison: null,
    traceability: [],
    validationIssues: [],
    policyUpdates: [],
    jobRoles: [],
    documents: [],
    errors: {},
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [filters] = useState<{
    status?: string;
    search?: string;
  }>({});

  const loadData = useCallback(async (currentFilters?: { status?: string; search?: string }) => {
    setLoading(true);
    try {
      const res = await fetchReviewerDashboardData(currentFilters);
      setData(res);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      console.error('Failed to load reviewer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const res = await fetchReviewerDashboardData(filters);
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

  const handleRefresh = () => {
    loadData(filters);
  };

  return (
    <AppLayout allowedRoles={['admin', 'reviewer', 'compliance_manager']}>
      <DashboardPageContainer>
        {/* Header */}
        <ReviewerDashboardHeader
          lastRefreshed={lastRefreshed}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* System & Health Status Indicator */}
        <ReviewHealth
          health={data.health}
          reviewQueue={data.reviewQueue}
          loading={loading}
          error={data.errors.health}
        />

        {/* Top-level Reviewer KPI Grid */}
        <ReviewerKpiGrid
          overview={data.overview}
          reviewQueue={data.reviewQueue}
          validationIssues={data.validationIssues}
          traceability={data.traceability}
          loading={loading}
          error={data.errors.overview}
        />

        {/* Primary Review Queue Data Table */}
        <ReviewQueue
          items={data.reviewQueue}
          loading={loading}
          error={data.errors.reviewQueue}
          onRefresh={handleRefresh}
        />

        {/* Priority Items + Review Decisions Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriorityReviewItems
            reviewQueue={data.reviewQueue}
            loading={loading}
            error={data.errors.reviewQueue}
          />
          <ReviewerDecisionSummary
            reviewQueue={data.reviewQueue}
            loading={loading}
            error={data.errors.reviewQueue}
          />
        </div>

        {/* Validation Health + GenAI vs Python Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ValidationHealth
            comparison={data.comparison}
            validationIssues={data.validationIssues}
            traceability={data.traceability}
            loading={loading}
            error={data.errors.comparison}
          />
          <GenAIValidationComparison
            comparison={data.comparison}
            loading={loading}
            error={data.errors.comparison}
          />
        </div>

        {/* Traceability Overview + Ground-Truth Validation Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TraceabilityOverview
            items={data.traceability}
            loading={loading}
            error={data.errors.traceability}
          />
          <ValidationIssues
            items={data.validationIssues}
            loading={loading}
            error={data.errors.validationIssues}
          />
        </div>

        {/* Policy Impact + Recent Audit Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReviewerPolicyImpact
            policyUpdates={data.policyUpdates}
            loading={loading}
            error={data.errors.policyUpdates}
          />
          <RecentReviewActivity
            reviewQueue={data.reviewQueue}
            loading={loading}
          />
        </div>

        {/* Reviewer Navigation Shortcuts */}
        <ReviewerQuickActions />

        {/* Exportable Reports Section */}
        <ReviewerReports />
      </DashboardPageContainer>
    </AppLayout>
  );
}
