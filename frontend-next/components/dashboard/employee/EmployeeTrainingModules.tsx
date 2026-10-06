'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleProgressItem } from '@/lib/services/employeeDashboard';
import { BookOpen, Search, CheckCircle2, Clock, Play, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface EmployeeTrainingModulesProps {
  modules: ModuleProgressItem[];
  loading: boolean;
  error?: string;
  onRefreshNeeded?: () => void;
}

export function EmployeeTrainingModules({
  modules,
  loading,
  error,
  onRefreshNeeded,
}: EmployeeTrainingModulesProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleStart = async (moduleId: string) => {
    setActionInProgress(moduleId);
    try {
      await api.post(`/api/employee/me/modules/${moduleId}/start`, {});
      if (onRefreshNeeded) onRefreshNeeded();
      router.push(`/employee/learning/module/${moduleId}`);
    } catch {
      router.push(`/employee/learning/module/${moduleId}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleComplete = async (moduleId: string) => {
    setActionInProgress(moduleId);
    try {
      await api.post(`/api/employee/me/modules/${moduleId}/complete`, {});
      if (onRefreshNeeded) onRefreshNeeded();
    } catch {
      // Ignore or let parent refresh
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-800/60 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-14 bg-slate-800/60 rounded"></div>
          <div className="h-14 bg-slate-800/60 rounded"></div>
          <div className="h-14 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-100 mb-2">Assigned Modules</h2>
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg text-sm">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.module_code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && m.completion_status === 'completed') ||
      (filterStatus === 'in_progress' && (m.completion_status === 'in_progress' || m.completion_status === 'started')) ||
      (filterStatus === 'assigned' && m.completion_status === 'assigned') ||
      (filterStatus === 'mandatory' && m.is_mandatory);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            My Assigned Modules ({modules.length})
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Detailed list of learning modules assigned to your profile
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'in_progress', 'assigned', 'completed', 'mandatory'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize border transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search modules by title, code, or requirement..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Modules Table / List */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">No matching modules found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter options.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Module Info</th>
                <th className="py-3 px-4">Est. Time</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredModules.map((mod) => {
                const isCompleted = mod.completion_status === 'completed';
                const isStarted = mod.completion_status === 'in_progress' || mod.completion_status === 'started';
                const pct = mod.completion_percentage || (isCompleted ? 100 : isStarted ? 50 : 0);

                return (
                  <tr key={mod.module_id} className="hover:bg-slate-950/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        {mod.title}
                        {mod.is_mandatory && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 rounded">
                            Mandatory
                          </span>
                        )}
                      </div>
                      {mod.purpose && <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{mod.purpose}</div>}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {mod.estimated_duration_minutes ? `${mod.estimated_duration_minutes} mins` : 'Self-paced'}
                    </td>

                    <td className="py-3.5 px-4 text-xs capitalize text-slate-400 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800/60 font-medium">
                        {mod.difficulty || 'standard'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 w-36">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              isCompleted ? 'bg-emerald-500' : isStarted ? 'bg-indigo-600' : 'bg-slate-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-300 w-8 text-right">{pct}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isStarted
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : isStarted ? (
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                        )}
                        {mod.completion_status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {!isCompleted && !isStarted && (
                          <button
                            onClick={() => handleStart(mod.module_id)}
                            disabled={actionInProgress === mod.module_id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            Start
                          </button>
                        )}

                        {isStarted && (
                          <button
                            onClick={() => handleComplete(mod.module_id)}
                            disabled={actionInProgress === mod.module_id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Complete
                          </button>
                        )}

                        <button
                          onClick={() => router.push(`/employee/learning/module/${mod.module_id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/60"
                          title="View module details and materials"
                        >
                          View <ArrowRight className="w-3 h-3 ml-0.5" />
                        </button>
                      </div>
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
