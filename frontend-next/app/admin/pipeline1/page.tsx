'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import {
  fetchRoles,
  fetchRoleRequirements,
  JobRoleResponseSchema,
  MatrixRequirementResponseSchema,
} from '@/lib/services/rrm';
import { fetchDocuments, DocumentMetadataResponse } from '@/lib/services/documentManagement';
import {
  generateOnboardingPlan,
  fetchPlanDetails,
  fetchPlanRawJson,
  fetchPlanSources,
  fetchExecutionRun,
  fetchEmployees,
  EmployeeItem,
  Pipeline1GenerationResult,
  Pipeline1PlanDetails,
  Pipeline1PlanSources,
  Pipeline1ExecutionRun,
} from '@/lib/services/pipeline1';

import { Pipeline1Header } from '@/components/pipeline1/Pipeline1Header';
import { Pipeline1RoleSelector } from '@/components/pipeline1/Pipeline1RoleSelector';
import { Pipeline1GroundTruth } from '@/components/pipeline1/Pipeline1GroundTruth';
import { Pipeline1SourceContext } from '@/components/pipeline1/Pipeline1SourceContext';
import { Pipeline1GenerationForm } from '@/components/pipeline1/Pipeline1GenerationForm';
import { Pipeline1GenerationState } from '@/components/pipeline1/Pipeline1GenerationState';
import { Pipeline1GenerationResultCard } from '@/components/pipeline1/Pipeline1GenerationResultCard';
import { Pipeline1PlanViewer } from '@/components/pipeline1/Pipeline1PlanViewer';
import { Pipeline1GenerationMetadata } from '@/components/pipeline1/Pipeline1GenerationMetadata';
import { Pipeline1Warnings } from '@/components/pipeline1/Pipeline1Warnings';
import { Pipeline1Pipeline2Handoff } from '@/components/pipeline1/Pipeline1Pipeline2Handoff';

function Pipeline1PageContent() {
  const searchParams = useSearchParams();
  const urlPlanId = searchParams?.get('plan_id') || searchParams?.get('planId');

  const [roles, setRoles] = useState<JobRoleResponseSchema[]>([]);
  const [selectedRole, setSelectedRole] = useState<JobRoleResponseSchema | null>(null);
  const [requirements, setRequirements] = useState<MatrixRequirementResponseSchema[]>([]);
  const [allDocuments, setAllDocuments] = useState<DocumentMetadataResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [referencedDocIds, setReferencedDocIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGeneratingEmpId, setActiveGeneratingEmpId] = useState<string>('');

  // Generation Results State
  const [generationResult, setGenerationResult] = useState<Pipeline1GenerationResult | null>(null);
  const [planDetails, setPlanDetails] = useState<Pipeline1PlanDetails | null>(null);
  const [planRawJson, setPlanRawJson] = useState<Record<string, unknown> | null>(null);
  const [planSources, setPlanSources] = useState<Pipeline1PlanSources | null>(null);
  const [executionRun, setExecutionRun] = useState<Pipeline1ExecutionRun | null>(null);

  const handleSelectRole = useCallback(async (role: JobRoleResponseSchema) => {
    setSelectedRole(role);
    try {
      const reqs = await fetchRoleRequirements(role.role_code || role.role_id);
      setRequirements(reqs);

      // Extract unique referenced document IDs from requirements
      const docIds = Array.from(
        new Set(reqs.map((r) => r.source_document_id).filter(Boolean))
      );
      setReferencedDocIds(docIds);
    } catch {
      setRequirements([]);
      setReferencedDocIds([]);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rList, dList, eList] = await Promise.all([
        fetchRoles().catch(() => []),
        fetchDocuments().catch(() => []),
        fetchEmployees().catch(() => []),
      ]);
      setRoles(rList);
      setAllDocuments(dList);
      setEmployees(eList);
      if (rList.length > 0) {
        handleSelectRole(rList[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles and documents context');
    } finally {
      setLoading(false);
    }
  }, [handleSelectRole]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        const [rList, dList, eList] = await Promise.all([
          fetchRoles().catch(() => []),
          fetchDocuments().catch(() => []),
          fetchEmployees().catch(() => []),
        ]);
        if (isMounted) {
          setRoles(rList);
          setAllDocuments(dList);
          setEmployees(eList);
          if (rList.length > 0) {
            setSelectedRole(rList[0]);
            const reqs = await fetchRoleRequirements(rList[0].role_code || rList[0].role_id).catch(() => []);
            if (isMounted) {
              setRequirements(reqs);
              const docIds = Array.from(new Set(reqs.map((r) => r.source_document_id).filter(Boolean)));
              setReferencedDocIds(docIds);
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load initial context');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Optionally load existing plan details if plan_id passed via query param
  useEffect(() => {
    if (!urlPlanId) return;
    const planIdToFetch: string = urlPlanId;
    let isMounted = true;
    async function loadExistingPlan() {
      try {
        const [pDetails, pJson, pSources] = await Promise.all([
          fetchPlanDetails(planIdToFetch),
          fetchPlanRawJson(planIdToFetch).catch(() => null),
          fetchPlanSources(planIdToFetch).catch(() => null),
        ]);
        if (isMounted && pDetails) {
          setPlanDetails(pDetails);
          setPlanRawJson(pJson);
          setPlanSources(pSources);
        }
      } catch {
        // Ignore fallback
      }
    }
    loadExistingPlan();
    return () => {
      isMounted = false;
    };
  }, [urlPlanId]);

  const handleGenerate = async (employeeId: string, modelName: string, promptVersion: string) => {
    if (!selectedRole) return;

    setIsGenerating(true);
    setActiveGeneratingEmpId(employeeId);
    setError(null);
    setGenerationResult(null);
    setPlanDetails(null);
    setPlanRawJson(null);
    setPlanSources(null);
    setExecutionRun(null);

    try {
      const genRes = await generateOnboardingPlan({
        employee_id: employeeId,
        role_id: selectedRole.role_id,
        role_identifier: selectedRole.role_code,
        model_name: modelName,
        prompt_version: promptVersion,
      });

      setGenerationResult(genRes);

      // Fetch plan details, raw json, sources, and execution telemetry
      if (genRes.plan_id) {
        const [pDetails, pJson, pSources] = await Promise.all([
          fetchPlanDetails(genRes.plan_id).catch(() => null),
          fetchPlanRawJson(genRes.plan_id).catch(() => genRes.structured_json_output),
          fetchPlanSources(genRes.plan_id).catch(() => null),
        ]);
        setPlanDetails(pDetails);
        setPlanRawJson(pJson);
        setPlanSources(pSources);
      }

      if (genRes.execution_id) {
        const eRun = await fetchExecutionRun(genRes.execution_id).catch(() => null);
        setExecutionRun(eRun);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Pipeline 1 generation error.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout allowedRoles={['admin', 'training_manager', 'hr_manager', 'reviewer', 'compliance_manager', 'manager']}>
      <DashboardPageContainer>
        {/* Workspace Header */}
        <Pipeline1Header onRefresh={loadInitialData} loading={loading} />

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl mb-6 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadInitialData}
              className="px-3 py-1 bg-rose-600 text-white font-semibold text-xs rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Role Selector Card */}
        <Pipeline1RoleSelector
          roles={roles}
          selectedRole={selectedRole}
          onSelectRole={handleSelectRole}
          requirements={requirements}
          loading={loading}
        />

        {/* Ground Truth Requirements Panel */}
        <Pipeline1GroundTruth requirements={requirements} loading={loading} />

        {/* Source Document Context Panel */}
        <Pipeline1SourceContext
          referencedDocIds={referencedDocIds}
          allDocuments={allDocuments}
          loading={loading}
        />

        {/* Generation Form */}
        <Pipeline1GenerationForm
          selectedRole={selectedRole}
          requirements={requirements}
          referencedDocIds={referencedDocIds}
          employees={employees}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        {/* Loading State when generation is running */}
        {isGenerating && (
          <Pipeline1GenerationState
            roleCode={selectedRole?.role_code}
            employeeId={activeGeneratingEmpId}
          />
        )}

        {/* Generation Result Banner & Pipeline 2 Handoff CTA */}
        {(generationResult || planDetails) && !isGenerating && (
          <Pipeline1GenerationResultCard
            generationResult={generationResult}
            planDetails={planDetails}
            executionRun={executionRun}
          />
        )}

        {/* Warnings Banner if execution run has error logs */}
        {executionRun?.error_log && (
          <Pipeline1Warnings errorLog={executionRun.error_log} />
        )}

        {/* Pipeline 1 -> Pipeline 2 Handoff Transition */}
        {planDetails && planDetails.plan_id && (
          <Pipeline1Pipeline2Handoff planId={planDetails.plan_id} />
        )}

        {/* Generated Plan Viewer */}
        {planDetails && (
          <Pipeline1PlanViewer
            plan={planDetails}
            rawJson={planRawJson || generationResult?.structured_json_output}
            sources={planSources}
          />
        )}

        {/* Technical Generation Telemetry */}
        {executionRun && (
          <Pipeline1GenerationMetadata executionRun={executionRun} loading={loading} />
        )}
      </DashboardPageContainer>
    </AppLayout>
  );
}

export default function AdminPipeline1Page() {
  return (
    <Suspense fallback={
      <AppLayout>
        <DashboardPageContainer>
          <div className="p-8 text-center text-slate-400">Loading Pipeline 1...</div>
        </DashboardPageContainer>
      </AppLayout>
    }>
      <Pipeline1PageContent />
    </Suspense>
  );
}
