'use client';

import React, { useState } from 'react';
import { ReviewQueueItemResponse } from '@/lib/services/humanReview';
import { Search, ChevronRight, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ReviewQueueTableProps {
  queueItems: ReviewQueueItemResponse[];
  selectedReviewId: string | null;
  onSelectReview: (item: ReviewQueueItemResponse) => void;
  loading: boolean;
}

export function ReviewQueueTable({
  queueItems,
  selectedReviewId,
  onSelectReview,
  loading,
}: ReviewQueueTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-800/60 rounded"></div>
          <div className="h-12 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredItems = queueItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.review_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.plan_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st: string) => {
    switch (st.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      case 'rejected':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/60';
      case 'pending':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      default:
        return 'bg-slate-800/60 text-slate-200 border-slate-700';
    }
  };

  const getStatusIcon = (st: string) => {
    switch (st.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'pending':
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Manual Review Queue ({filteredItems.length})</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a review item to inspect validation flags and execute reviewer governance actions
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto py-1.5 px-3 text-xs border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
          No matching review queue items found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Review / Plan ID</th>
                <th className="py-3 px-4">Target Employee</th>
                <th className="py-3 px-4">Job Role</th>
                <th className="py-3 px-4">Coverage Score</th>
                <th className="py-3 px-4">Validation Status</th>
                <th className="py-3 px-4">Queue Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const isSelected = item.review_id === selectedReviewId;

                return (
                  <tr
                    key={item.review_id}
                    onClick={() => onSelectReview(item)}
                    className={`cursor-pointer transition-colors hover:bg-purple-950/40 ${
                      isSelected ? 'bg-purple-950/60 border-l-4 border-l-purple-500 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">
                      <div>{item.plan_id}</div>
                      <div className="text-[10px] text-slate-400 font-normal">ID: {item.review_id.slice(0, 8)}...</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{item.employee_name}</div>
                      <div className="text-[11px] text-slate-400">{item.employee_id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{item.role_title}</div>
                      <div className="text-[11px] text-slate-400">{item.department}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-400 font-mono">{item.mandatory_coverage_score}%</div>
                      <div className="text-[10px] text-slate-400 font-mono">Trace: {item.source_traceability_score}%</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-800/60 text-slate-300">
                        {item.verification_status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border flex items-center gap-1 w-fit ${getStatusBadge(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReview(item);
                        }}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
