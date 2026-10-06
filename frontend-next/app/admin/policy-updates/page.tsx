'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import {
  fetchPolicyUpdates,
  fetchAffectedRequirements,
  fetchAffectedPlans,
  fetchAffectedEmployees,
  fetchRegenerationStatus,
  fetchPolicyUpdateAuditHistory,
  triggerSelectiveRegeneration,
  PolicyUpdateSummaryResponse,
  AffectedRequirementResponse,
  AffectedPlanResponse,
  AffectedEmployeeResponse,
  RegenerationStatusResponse,
  PolicyAuditEventResponse,
} from '@/lib/services/policyUpdates';

import { PolicyUpdatesHeader } from '@/components/policyUpdates/PolicyUpdatesHeader';
import { PolicyUpdateOverview } from '@/components/policyUpdates/PolicyUpdateOverview';
import { PolicyUpdateTable } from '@/components/policyUpdates/PolicyUpdateTable';
import { PolicyImpactSummary } from '@/components/policyUpdates/PolicyImpactSummary';
import { AffectedRequirements } from '@/components/policyUpdates/AffectedRequirements';
import { AffectedPlans } from '@/components/policyUpdates/AffectedPlans';
import { AffectedEmployees } from '@/components/policyUpdates/AffectedEmployees';
import { SelectiveRegeneration } from '@/components/policyUpdates/SelectiveRegeneration';
import { PolicyUpdateHistory } from '@/components/policyUpdates/PolicyUpdateHistory';

export default function PolicyUpdatesPage() {
  const [updates, setUpdates] = useState<PolicyUpdateSummaryResponse[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<PolicyUpdateSummaryResponse | null>(null);

  const [affectedReqs, setAffectedReqs] = useState<AffectedRequirementResponse[]>([]);
  const [affectedPlans, setAffectedPlans] = useState<AffectedPlanResponse[]>([]);
  const [affectedEmployees, setAffectedEmployees] = useState<AffectedEmployeeResponse[]>([]);
  const [regenStatus, setRegenStatus] = useState<RegenerationStatusResponse | null>(null);
  const [auditHistory, setAuditHistory] = useState<PolicyAuditEventResponse[]>([]);

  const [loadingUpdates, setLoadingUpdates] = useState<boolean>(true);
  const [loadingImpact, setLoadingImpact] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function initUpdates() {
      setLoadingUpdates(true);
      setErrorMsg(null);
      try {
        const uData = await fetchPolicyUpdates();
        if (!ignore) {
          setUpdates(uData);
          if (uData.length > 0 && !selectedUpdate) {
            setSelectedUpdate(uData[0]);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch policy updates.');
        }
      } finally {
        if (!ignore) setLoadingUpdates(false);
      }
    }

    initUpdates();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const target = selectedUpdate;
    if (!target) return;
    const updateId = target.update_id;

    let ignore = false;
    async function initImpactData() {
      setLoadingImpact(true);
      setErrorMsg(null);

      try {
        const [reqs, plans, emps, status, history] = await Promise.all([
          fetchAffectedRequirements(updateId).catch(() => []),
          fetchAffectedPlans(updateId).catch(() => []),
          fetchAffectedEmployees(updateId).catch(() => []),
          fetchRegenerationStatus(updateId).catch(() => null),
          fetchPolicyUpdateAuditHistory(updateId).catch(() => []),
        ]);

        if (!ignore) {
          setAffectedReqs(reqs);
          setAffectedPlans(plans);
          setAffectedEmployees(emps);
          setRegenStatus(status);
          setAuditHistory(history);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load policy impact details.');
        }
      } finally {
        if (!ignore) setLoadingImpact(false);
      }
    }

    initImpactData();
    return () => {
      ignore = true;
    };
  }, [selectedUpdate]);

  const reloadData = async () => {
    setLoadingUpdates(true);
    setErrorMsg(null);
    try {
      const uData = await fetchPolicyUpdates();
      setUpdates(uData);
      if (selectedUpdate) {
        const updated = uData.find((u) => u.update_id === selectedUpdate.update_id);
        if (updated) setSelectedUpdate(updated);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to refresh updates.');
    } finally {
      setLoadingUpdates(false);
    }
  };

  const handleTriggerRegeneration = async () => {
    if (!selectedUpdate) return;

    setRegenerating(true);
    setErrorMsg(null);

    try {
      const res = await triggerSelectiveRegeneration(selectedUpdate.update_id);
      setRegenStatus(res);
      await reloadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Selective regeneration failed.');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <AppLayout>
      <DashboardPageContainer>
        <div className="space-y-6">
          <PolicyUpdatesHeader
            onRefresh={reloadData}
            loading={loadingUpdates}
            totalUpdates={updates.length}
          />

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-semibold shadow-sm">
              Error: {errorMsg}
            </div>
          )}

          <PolicyUpdateOverview
            updates={updates}
            loading={loadingUpdates}
          />

          <PolicyUpdateTable
            updates={updates}
            selectedUpdateId={selectedUpdate?.update_id || null}
            onSelectUpdate={(u) => setSelectedUpdate(u)}
            loading={loadingUpdates}
          />

          {selectedUpdate && (
            <>
              <PolicyImpactSummary
                update={selectedUpdate}
                loading={loadingImpact}
              />

              <SelectiveRegeneration
                updateId={selectedUpdate.update_id}
                onTriggerRegeneration={handleTriggerRegeneration}
                status={regenStatus}
                regenerating={regenerating}
                errorMsg={errorMsg}
              />

              <AffectedRequirements
                requirements={affectedReqs}
                loading={loadingImpact}
              />

              <AffectedPlans
                plans={affectedPlans}
                loading={loadingImpact}
              />

              <AffectedEmployees
                employees={affectedEmployees}
                loading={loadingImpact}
              />

              <PolicyUpdateHistory
                historyEvents={auditHistory}
                loading={loadingImpact}
              />
            </>
          )}
        </div>
      </DashboardPageContainer>
    </AppLayout>
  );
}
