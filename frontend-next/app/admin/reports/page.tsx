'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import {
  getOverview,
  getEmployeeProgress,
  getRoleCoverage,
  getMandatoryTraining,
  getAssessments,
  getTraceability,
  getHallucinations,
  getPolicyCoverage,
  getGenAIVsPython,
  exportReportFile,
  OverviewMetricsResponse,
  EmployeeProgressReportResponse,
  RoleCoverageReportItem,
  MandatoryTrainingReportItem,
  AssessmentReportSummary,
  TraceabilityReportItem,
  HallucinationReportItem,
  PolicyCoverageReportItem,
  GenAIPythonComparisonSummary,
  ReportFilterParams,
} from '@/lib/services/reports';

import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { ReportsFilterBar } from '@/components/reports/ReportsFilterBar';
import { ReportsOverview } from '@/components/reports/ReportsOverview';
import { EmployeeProgressReport } from '@/components/reports/EmployeeProgressReport';
import { RoleCoverageReport } from '@/components/reports/RoleCoverageReport';
import { MandatoryTrainingReport } from '@/components/reports/MandatoryTrainingReport';
import { AssessmentReport } from '@/components/reports/AssessmentReport';
import { TraceabilityReport } from '@/components/reports/TraceabilityReport';
import { ValidationQualityReport } from '@/components/reports/ValidationQualityReport';
import { PolicyCoverageReport } from '@/components/reports/PolicyCoverageReport';
import { GenAIVsPythonReport } from '@/components/reports/GenAIVsPythonReport';

import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filters, setFilters] = useState<ReportFilterParams>({ page: 1, size: 10 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Data states
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetricsResponse | null>(null);
  const [employeeProgress, setEmployeeProgress] = useState<EmployeeProgressReportResponse | null>(null);
  const [roleCoverage, setRoleCoverage] = useState<RoleCoverageReportItem[]>([]);
  const [mandatoryTraining, setMandatoryTraining] = useState<MandatoryTrainingReportItem[]>([]);
  const [assessments, setAssessments] = useState<AssessmentReportSummary | null>(null);
  const [traceability, setTraceability] = useState<TraceabilityReportItem[]>([]);
  const [hallucinations, setHallucinations] = useState<HallucinationReportItem[]>([]);
  const [policyCoverage, setPolicyCoverage] = useState<PolicyCoverageReportItem[]>([]);
  const [genaiVsPython, setGenaiVsPython] = useState<GenAIPythonComparisonSummary | null>(null);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'overview') {
        const [overviewRes, progressRes] = await Promise.all([
          getOverview(),
          getEmployeeProgress(filters),
        ]);
        setOverviewMetrics(overviewRes);
        setEmployeeProgress(progressRes);
      } else if (activeTab === 'employee_progress') {
        const progressRes = await getEmployeeProgress(filters);
        setEmployeeProgress(progressRes);
      } else if (activeTab === 'role_coverage') {
        const roleRes = await getRoleCoverage(filters);
        setRoleCoverage(roleRes);
      } else if (activeTab === 'mandatory_training') {
        const mandatoryRes = await getMandatoryTraining(filters);
        setMandatoryTraining(mandatoryRes);
      } else if (activeTab === 'assessments') {
        const assessRes = await getAssessments(filters);
        setAssessments(assessRes);
      } else if (activeTab === 'traceability') {
        const traceRes = await getTraceability(filters);
        setTraceability(traceRes);
      } else if (activeTab === 'validation_quality') {
        const hallucinationRes = await getHallucinations(filters);
        setHallucinations(hallucinationRes);
      } else if (activeTab === 'policy_coverage') {
        const policyRes = await getPolicyCoverage(filters);
        setPolicyCoverage(policyRes);
      } else if (activeTab === 'genai_vs_python') {
        const genaiRes = await getGenAIVsPython(filters);
        setGenaiVsPython(genaiRes);
      }
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'overview') {
          const [overviewRes, progressRes] = await Promise.all([
            getOverview(),
            getEmployeeProgress(filters),
          ]);
          if (isMounted) {
            setOverviewMetrics(overviewRes);
            setEmployeeProgress(progressRes);
          }
        } else if (activeTab === 'employee_progress') {
          const progressRes = await getEmployeeProgress(filters);
          if (isMounted) setEmployeeProgress(progressRes);
        } else if (activeTab === 'role_coverage') {
          const roleRes = await getRoleCoverage(filters);
          if (isMounted) setRoleCoverage(roleRes);
        } else if (activeTab === 'mandatory_training') {
          const mandatoryRes = await getMandatoryTraining(filters);
          if (isMounted) setMandatoryTraining(mandatoryRes);
        } else if (activeTab === 'assessments') {
          const assessRes = await getAssessments(filters);
          if (isMounted) setAssessments(assessRes);
        } else if (activeTab === 'traceability') {
          const traceRes = await getTraceability(filters);
          if (isMounted) setTraceability(traceRes);
        } else if (activeTab === 'validation_quality') {
          const hallucinationRes = await getHallucinations(filters);
          if (isMounted) setHallucinations(hallucinationRes);
        } else if (activeTab === 'policy_coverage') {
          const policyRes = await getPolicyCoverage(filters);
          if (isMounted) setPolicyCoverage(policyRes);
        } else if (activeTab === 'genai_vs_python') {
          const genaiRes = await getGenAIVsPython(filters);
          if (isMounted) setGenaiVsPython(genaiRes);
        }
        if (isMounted) setLastRefreshed(new Date());
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load report data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeTab, filters]);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    exportReportFile(activeTab, format, filters);
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, size: 10 });
  };

  return (
    <AppLayout allowedRoles={['admin', 'training_manager', 'hr_manager', 'reviewer', 'compliance_manager', 'manager']}>
      <DashboardPageContainer>
        {/* Reports Workspace Header */}
        <ReportsHeader
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setFilters({ page: 1, size: 10 });
          }}
          lastRefreshed={lastRefreshed || undefined}
          loading={loading}
          onRefresh={fetchReportData}
          onExport={handleExport}
        />

        {/* Global Filter Bar */}
        <ReportsFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          showStatusFilter={activeTab === 'overview' || activeTab === 'employee_progress' || activeTab === 'assessments'}
          showDepartmentFilter={activeTab !== 'validation_quality' && activeTab !== 'policy_coverage' && activeTab !== 'genai_vs_python'}
          showRoleFilter={activeTab !== 'validation_quality' && activeTab !== 'policy_coverage' && activeTab !== 'genai_vs_python'}
          showFlagTypeFilter={activeTab === 'validation_quality'}
          showSeverityFilter={activeTab === 'validation_quality'}
        />

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-center justify-between text-rose-800 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchReportData}
              className="px-3 py-1 bg-slate-900 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Active Tab View */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ReportsOverview metrics={overviewMetrics} loading={loading} />
            <EmployeeProgressReport
              data={employeeProgress}
              loading={loading}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </div>
        )}

        {activeTab === 'employee_progress' && (
          <EmployeeProgressReport
            data={employeeProgress}
            loading={loading}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        )}

        {activeTab === 'role_coverage' && (
          <RoleCoverageReport items={roleCoverage} loading={loading} />
        )}

        {activeTab === 'mandatory_training' && (
          <MandatoryTrainingReport items={mandatoryTraining} loading={loading} />
        )}

        {activeTab === 'assessments' && (
          <AssessmentReport summary={assessments} loading={loading} />
        )}

        {activeTab === 'traceability' && (
          <TraceabilityReport items={traceability} loading={loading} />
        )}

        {activeTab === 'validation_quality' && (
          <ValidationQualityReport items={hallucinations} loading={loading} />
        )}

        {activeTab === 'policy_coverage' && (
          <PolicyCoverageReport items={policyCoverage} loading={loading} />
        )}

        {activeTab === 'genai_vs_python' && (
          <GenAIVsPythonReport data={genaiVsPython} loading={loading} />
        )}
      </DashboardPageContainer>
    </AppLayout>
  );
}
