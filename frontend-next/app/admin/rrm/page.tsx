'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import {
  fetchRoles,
  fetchRequirements,
  fetchRrmSummary,
  deleteRole,
  deleteRequirement,
  JobRoleResponseSchema,
  MatrixRequirementResponseSchema,
  RRMSummaryResponseSchema,
} from '@/lib/services/rrm';

import { RrmHeader } from '@/components/rrm/RrmHeader';
import { RrmStats } from '@/components/rrm/RrmStats';
import { RoleDirectory } from '@/components/rrm/RoleDirectory';
import { RequirementFilters } from '@/components/rrm/RequirementFilters';
import { RequirementTable } from '@/components/rrm/RequirementTable';
import { RoleFormModal } from '@/components/rrm/RoleFormModal';
import { RequirementFormModal } from '@/components/rrm/RequirementFormModal';
import { RoleDetailModal } from '@/components/rrm/RoleDetailModal';
import { RrmHealth } from '@/components/rrm/RrmHealth';
import { RecentRrmActivity } from '@/components/rrm/RecentRrmActivity';

export default function AdminRRMPage() {
  const [roles, setRoles] = useState<JobRoleResponseSchema[]>([]);
  const [requirements, setRequirements] = useState<MatrixRequirementResponseSchema[]>([]);
  const [summary, setSummary] = useState<RRMSummaryResponseSchema | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [mandatoryFilter, setMandatoryFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals & Active Edit Targets
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [editRoleTarget, setEditRoleTarget] = useState<JobRoleResponseSchema | null>(null);
  const [editReqTarget, setEditReqTarget] = useState<MatrixRequirementResponseSchema | null>(null);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<JobRoleResponseSchema | null>(null);

  const loadRrmData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rList, reqList, sumData] = await Promise.all([
        fetchRoles().catch(() => []),
        fetchRequirements({ status_filter: true }).catch(() => []),
        fetchRrmSummary().catch(() => null),
      ]);
      setRoles(rList);
      setRequirements(reqList);
      setSummary(sumData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch RRM ground truth data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        const [rList, reqList, sumData] = await Promise.all([
          fetchRoles().catch(() => []),
          fetchRequirements({ status_filter: true }).catch(() => []),
          fetchRrmSummary().catch(() => null),
        ]);
        if (isMounted) {
          setRoles(rList);
          setRequirements(reqList);
          setSummary(sumData);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load RRM data');
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setMandatoryFilter('all');
    setClassificationFilter('all');
    setPriorityFilter('all');
  };

  const handleDeleteRole = async (roleCode: string) => {
    if (!confirm(`Are you sure you want to deactivate job role '${roleCode}'?`)) return;
    try {
      await deleteRole(roleCode);
      await loadRrmData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate role');
    }
  };

  const handleDeleteRequirement = async (reqId: string) => {
    if (!confirm(`Are you sure you want to deactivate matrix requirement '${reqId}'?`)) return;
    try {
      await deleteRequirement(reqId);
      await loadRrmData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate requirement');
    }
  };

  // Filtered requirements
  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      !searchQuery ||
      req.requirement_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.role_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.policy_requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.required_competency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.source_document_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'all' || req.role_code.toLowerCase() === selectedRole.toLowerCase();
    const matchesMandatory =
      mandatoryFilter === 'all' ||
      (mandatoryFilter === 'mandatory_only' && req.is_mandatory) ||
      (mandatoryFilter === 'optional_only' && !req.is_mandatory);

    const matchesClassification =
      classificationFilter === 'all' || req.requirement_type.toLowerCase() === classificationFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || req.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesMandatory && matchesClassification && matchesPriority;
  });

  return (
    <AppLayout allowedRoles={['admin', 'training_manager', 'hr_manager', 'reviewer', 'compliance_manager', 'manager']}>
      <DashboardPageContainer>
        {/* Workspace Header */}
        <RrmHeader
          onRefresh={loadRrmData}
          onOpenCreateRole={() => {
            setEditRoleTarget(null);
            setIsRoleModalOpen(true);
          }}
          onOpenAddRequirement={() => {
            setEditReqTarget(null);
            setIsReqModalOpen(true);
          }}
          loading={loading}
          totalRoles={roles.length}
          totalReqs={requirements.length}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl mb-6 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadRrmData}
              className="px-3 py-1 bg-rose-600 text-white font-semibold text-xs rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* RRM Statistics */}
        <RrmStats summary={summary} loading={loading} error={error || undefined} />

        {/* Job Roles Directory */}
        <RoleDirectory
          roles={roles}
          loading={loading}
          onSelectRole={(r) => setSelectedRoleDetail(r)}
          onEditRole={(r) => {
            setEditRoleTarget(r);
            setIsRoleModalOpen(true);
          }}
          onDeleteRole={handleDeleteRole}
        />

        {/* RRM Health & Source Traceability Coverage */}
        <RrmHealth summary={summary} requirements={requirements} loading={loading} />

        {/* Search & Filters */}
        <RequirementFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          rolesList={roles}
          mandatoryFilter={mandatoryFilter}
          onMandatoryChange={setMandatoryFilter}
          classificationFilter={classificationFilter}
          onClassificationChange={setClassificationFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          onReset={handleResetFilters}
        />

        {/* Ground Truth Requirements Table */}
        <RequirementTable
          requirements={filteredRequirements}
          loading={loading}
          onEditRequirement={(req) => {
            setEditReqTarget(req);
            setIsReqModalOpen(true);
          }}
          onDeleteRequirement={handleDeleteRequirement}
        />

        {/* Activity Log */}
        <RecentRrmActivity requirements={requirements} roles={roles} loading={loading} />

        {/* Job Role Create/Edit Modal */}
        <RoleFormModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            setEditRoleTarget(null);
          }}
          onSuccess={loadRrmData}
          editRole={editRoleTarget}
        />

        {/* Matrix Requirement Create/Edit Modal */}
        <RequirementFormModal
          isOpen={isReqModalOpen}
          onClose={() => {
            setIsReqModalOpen(false);
            setEditReqTarget(null);
          }}
          onSuccess={loadRrmData}
          rolesList={roles}
          editRequirement={editReqTarget}
        />

        {/* Role Detail & Validation Inspection Modal */}
        <RoleDetailModal
          role={selectedRoleDetail}
          isOpen={!!selectedRoleDetail}
          onClose={() => setSelectedRoleDetail(null)}
          onEditRole={(r) => {
            setSelectedRoleDetail(null);
            setEditRoleTarget(r);
            setIsRoleModalOpen(true);
          }}
        />
      </DashboardPageContainer>
    </AppLayout>
  );
}
