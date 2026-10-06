'use client';

import React, { useState } from 'react';
import { PolicyUpdateSummaryResponse } from '@/lib/services/policyUpdates';
import { Search, ChevronRight, FileText, ArrowRight } from 'lucide-react';

interface PolicyUpdateTableProps {
  updates: PolicyUpdateSummaryResponse[];
  selectedUpdateId: string | null;
  onSelectUpdate: (u: PolicyUpdateSummaryResponse) => void;
  loading: boolean;
}

export function PolicyUpdateTable({
  updates,
  selectedUpdateId,
  onSelectUpdate,
  loading,
}: PolicyUpdateTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-800/60 rounded"></div>
          <div className="h-12 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredUpdates = updates.filter((u) => {
    return (
      !searchQuery ||
      u.update_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.document_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.document_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadge = (st: string) => {
    switch (st.toLowerCase()) {
      case 'completed':
      case 'published':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'analyzed':
      case 'detected':
      case 'outdated_marked':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'regenerating':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800/60 text-slate-200 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Detected Policy Document Updates ({filteredUpdates.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Document version change events detected by system and analyzed for ground-truth impact
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search document ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 text-slate-200 placeholder-slate-500 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>

      {filteredUpdates.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
          No policy document version updates detected.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Document / Update ID</th>
                <th className="py-3 px-4">Version Delta</th>
                <th className="py-3 px-4">Change Type</th>
                <th className="py-3 px-4">Affected Roles</th>
                <th className="py-3 px-4">Affected Plans</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUpdates.map((u) => {
                const isSelected = u.update_id === selectedUpdateId;

                return (
                  <tr
                    key={u.update_id}
                    onClick={() => onSelectUpdate(u)}
                    className={`cursor-pointer transition-colors hover:bg-slate-800/50 ${
                      isSelected ? 'bg-slate-800/80 border-l-4 border-l-blue-500 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span className="font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                          {u.document_id}
                        </span>
                        <span>{u.document_title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {u.update_id}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      <span className="flex items-center gap-1">
                        v{u.old_version} <ArrowRight className="w-3 h-3 text-slate-400" /> v{u.new_version}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800/60 text-slate-300 border border-slate-700">
                        {u.change_type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-indigo-400">
                      {u.affected_roles_count} Roles
                    </td>

                    <td className="py-3 px-4 font-bold text-amber-400">
                      {u.affected_plans_count} Plans ({u.affected_modules_count} Modules)
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getStatusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUpdate(u);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        Impact Detail <ChevronRight className="w-3.5 h-3.5" />
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
