'use client';

import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, CheckCircle2, XCircle, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import { ReviewQueueItemResponse } from '../../../lib/services/reviewerDashboard';
import { api } from '../../../lib/api';

interface ReviewQueueProps {
  items: ReviewQueueItemResponse[];
  loading: boolean;
  error?: string;
  onRefresh?: () => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  items,
  loading,
  error,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const roles = Array.from(new Set(items.map((i) => i.role_title).filter(Boolean)));

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    const matchesRole = !selectedRole || item.role_title === selectedRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      await api.post(`/api/human-review/${reviewId}/approve`, {
        reviewer_id: 'Reviewer Admin',
        comments: 'Approved via Reviewer Dashboard',
      });
      alert('Plan approved successfully!');
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to approve plan.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    setActionLoading(reviewId);
    try {
      await api.post(`/api/human-review/${reviewId}/reject`, {
        reviewer_id: 'Reviewer Admin',
        reason,
      });
      alert('Plan rejected successfully.');
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reject plan.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center text-[11px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </span>
        );
      case 'edited':
        return (
          <span className="inline-flex items-center text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
            Edited
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
            <Clock className="h-3 w-3 mr-1" /> Pending Review
          </span>
        );
    }
  };

  const getVerificationBadge = (vStatus: string) => {
    switch (vStatus) {
      case 'verified':
        return <span className="text-emerald-400 font-medium">Verified</span>;
      case 'verified_with_warning':
        return <span className="text-amber-400 font-medium">Warning</span>;
      case 'manual_review_required':
        return <span className="text-rose-400 font-medium">Review Required</span>;
      default:
        return <span className="text-slate-400 capitalize">{vStatus.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-100 flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            <span>Human Review Queue</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit AI-generated onboarding plans requiring human sign-off and ground-truth verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee or plan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 w-44 md:w-52"
            />
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Review Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="edited">Edited</option>
          </select>

          {/* Role filter */}
          {roles.length > 0 && (
            <div className="relative">
              <Filter className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-amber-950/20 border-b border-amber-800/30 p-3 text-xs text-amber-300">
          Warning: Could not fetch review queue: {error}
        </div>
      )}

      {/* Table content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <th className="py-3 px-4">Employee / Role</th>
              <th className="py-3 px-4">Plan ID</th>
              <th className="py-3 px-4">Coverage Score</th>
              <th className="py-3 px-4">Traceability Score</th>
              <th className="py-3 px-4">Validation Status</th>
              <th className="py-3 px-4">Review Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-12"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-12"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-20 ml-auto"></div></td>
                </tr>
              ))
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No items currently require review matching the filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const covPct = Math.round((item.mandatory_coverage_score || 0) * 100);
                const tracePct = Math.round((item.source_traceability_score || 0) * 100);
                const isPending = item.status === 'pending';

                return (
                  <tr key={item.review_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-100">
                      <div>{item.employee_name || 'Employee'}</div>
                      <div className="text-[11px] text-slate-400">{item.role_title} • {item.department}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {item.plan_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={`font-bold ${covPct >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {covPct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {tracePct}%
                    </td>
                    <td className="py-3.5 px-4">
                      {getVerificationBadge(item.verification_status)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApprove(item.review_id)}
                              disabled={actionLoading === item.review_id}
                              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium transition-colors"
                              title="Approve Plan"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(item.review_id)}
                              disabled={actionLoading === item.review_id}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-medium transition-colors"
                              title="Reject Plan"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => alert(`Review item details: ${item.review_id}\nReason: ${item.reason_for_review || 'Standard Review'}`)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Item Details"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
