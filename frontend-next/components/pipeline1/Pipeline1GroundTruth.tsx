'use client';

import React, { useState } from 'react';
import { MatrixRequirementResponseSchema } from '@/lib/services/rrm';
import { Database, FileCode, Search } from 'lucide-react';

interface Pipeline1GroundTruthProps {
  requirements: MatrixRequirementResponseSchema[];
  loading: boolean;
}

export function Pipeline1GroundTruth({ requirements, loading }: Pipeline1GroundTruthProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mandatoryOnly, setMandatoryOnly] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-800/60 rounded"></div>
          <div className="h-12 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredReqs = requirements.filter((req) => {
    const matchesSearch =
      !searchQuery ||
      req.requirement_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.policy_requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.required_competency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.source_document_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMandatory = !mandatoryOnly || req.is_mandatory;
    const matchesPriority = priorityFilter === 'all' || req.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesMandatory && matchesPriority;
  });

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Ground Truth Requirements Context ({filteredReqs.length} / {requirements.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Approved RRM requirements that Pipeline 1 will strictly ground during GenAI onboarding generation
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter requirements by ID, text, competency, or document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setMandatoryOnly(!mandatoryOnly)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              mandatoryOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            {mandatoryOnly ? 'Mandatory Only' : 'All Mandatory & Optional'}
          </button>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-2 px-3 text-xs border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Requirements List */}
      {filteredReqs.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
          No matching ground-truth requirements found for this filter.
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {filteredReqs.map((req) => (
            <div
              key={req.requirement_id}
              className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono font-bold text-slate-100">
                  <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded border border-indigo-200">
                    {req.requirement_id}
                  </span>
                  <span>{req.title || req.policy_requirement.slice(0, 45)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {req.is_mandatory && (
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-100 text-amber-800 rounded">
                      Mandatory
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-purple-100 text-purple-800 rounded">
                    {req.requirement_type}
                  </span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed">{req.policy_requirement}</p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="font-semibold text-slate-300">Competency: {req.required_competency}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <FileCode className="w-3 h-3 text-indigo-600" />
                  Source: {req.source_document_id} (Sec {req.source_section_id})
                </span>
                <span>•</span>
                <span className="capitalize">Stage: {req.due_stage.replace(/_/g, ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
