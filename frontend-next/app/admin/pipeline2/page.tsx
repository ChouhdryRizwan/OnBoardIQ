'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import { fetchPlanDetails, Pipeline1PlanDetails } from '@/lib/services/pipeline1';
import {
  runPipeline2Validation,
  fetchLatestValidationReport,
  fetchValidationIssues,
  ValidationReportResponse,
  ValidationIssue,
} from '@/lib/services/pipeline2';

import { Pipeline2Header } from '@/components/pipeline2/Pipeline2Header';
import { Pipeline2PlanSelector } from '@/components/pipeline2/Pipeline2PlanSelector';
import { Pipeline2PlanSummary } from '@/components/pipeline2/Pipeline2PlanSummary';
import { Pipeline2ValidationAction } from '@/components/pipeline2/Pipeline2ValidationAction';
import { Pipeline2ValidationOverview } from '@/components/pipeline2/Pipeline2ValidationOverview';
import { Pipeline2RequirementCoverage } from '@/components/pipeline2/Pipeline2RequirementCoverage';
import { Pipeline2RuleResults } from '@/components/pipeline2/Pipeline2RuleResults';
import { Pipeline2ValidationIssues } from '@/components/pipeline2/Pipeline2ValidationIssues';
import { Pipeline2Traceability } from '@/components/pipeline2/Pipeline2Traceability';
import { Pipeline2HumanReviewHandoff } from '@/components/pipeline2/Pipeline2HumanReviewHandoff';

function Pipeline2PageContent() {
  const searchParams = useSearchParams();
  const urlPlanId = searchParams?.get('plan_id') || searchParams?.get('planId');

  const [manualPlanId, setManualPlanId] = useState<string | null>(null);
  const selectedPlanId = manualPlanId !== null
    ? manualPlanId
    : (urlPlanId || '7e8cc594-f9a4-4e3c-924d-7fc7dbee705d');

  const [planDetails, setPlanDetails] = useState<Pipeline1PlanDetails | null>(null);
  const [report, setReport] = useState<ValidationReportResponse | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDataForPlan = useCallback(async (planId: string) => {
    if (!planId) return;
    setLoadingPlan(true);
    setLoadingReport(true);
    setErrorMsg(null);

    try {
      const pData = await fetchPlanDetails(planId);
      setPlanDetails(pData);
    } catch {
      setPlanDetails(null);
    } finally {
      setLoadingPlan(false);
    }

    try {
      const rData = await fetchLatestValidationReport(planId);
      setReport(rData);
      if (rData && rData.report_id) {
        try {
          const issData = await fetchValidationIssues(rData.report_id);
          setIssues(issData);
        } catch {
          setIssues([]);
        }
      }
    } catch {
      setReport(null);
      setIssues([]);
    } finally {
      setLoadingReport(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!selectedPlanId) return;
      setLoadingPlan(true);
      setLoadingReport(true);

      try {
        const pData = await fetchPlanDetails(selectedPlanId);
        if (!ignore) setPlanDetails(pData);
      } catch {
        if (!ignore) setPlanDetails(null);
      } finally {
        if (!ignore) setLoadingPlan(false);
      }

      try {
        const rData = await fetchLatestValidationReport(selectedPlanId);
        if (!ignore) {
          setReport(rData);
          if (rData && rData.report_id) {
            try {
              const issData = await fetchValidationIssues(rData.report_id);
              setIssues(issData);
            } catch {
              setIssues([]);
            }
          }
        }
      } catch {
        if (!ignore) {
          setReport(null);
          setIssues([]);
        }
      } finally {
        if (!ignore) setLoadingReport(false);
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, [selectedPlanId]);

  const handleRunValidation = async () => {
    if (!selectedPlanId) return;

    setValidating(true);
    setErrorMsg(null);

    try {
      const res = await runPipeline2Validation(selectedPlanId);
      setReport(res);

      if (res && res.report_id) {
        try {
          const issData = await fetchValidationIssues(res.report_id);
          setIssues(issData);
        } catch {
          setIssues([]);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Pipeline 2 validation failed.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <AppLayout>
      <DashboardPageContainer>
        <div className="space-y-6">
          <Pipeline2Header
            onRefresh={() => loadDataForPlan(selectedPlanId)}
            loading={loadingPlan || loadingReport}
          />

          <Pipeline2PlanSelector
            currentPlanId={selectedPlanId}
            onSelectPlanId={(newId) => setManualPlanId(newId)}
            loading={loadingPlan}
          />

          <Pipeline2PlanSummary plan={planDetails} loading={loadingPlan} />

          <Pipeline2ValidationAction
            planId={selectedPlanId}
            onRunValidation={handleRunValidation}
            validating={validating}
            errorMsg={errorMsg}
          />

          <Pipeline2ValidationOverview report={report} loading={loadingReport} />

          <Pipeline2RequirementCoverage
            comparisonDetails={report?.comparison_details || []}
            loading={loadingReport}
          />

          <Pipeline2RuleResults report={report} />

          <Pipeline2ValidationIssues
            issues={issues}
            hallucinationFlags={report?.hallucination_flags || []}
            contradictionFlags={report?.contradiction_flags || []}
            loading={loadingReport}
          />

          <Pipeline2Traceability report={report} />

          <Pipeline2HumanReviewHandoff report={report} />
        </div>
      </DashboardPageContainer>
    </AppLayout>
  );
}

export default function Pipeline2Page() {
  return (
    <Suspense fallback={
      <AppLayout>
        <DashboardPageContainer>
          <div className="p-8 text-center text-slate-400">Loading Pipeline 2...</div>
        </DashboardPageContainer>
      </AppLayout>
    }>
      <Pipeline2PageContent />
    </Suspense>
  );
}
