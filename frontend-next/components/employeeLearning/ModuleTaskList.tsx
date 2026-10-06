'use client';

import React, { useState } from 'react';
import { TaskProgressResponse } from '@/lib/services/employeeLearning';
import { CheckSquare, Clock, CheckCircle2, AlertCircle, Link as LinkIcon, Edit3, Check } from 'lucide-react';

interface ModuleTaskListProps {
  tasks: TaskProgressResponse[];
  loading: boolean;
  error?: string;
  onCompleteTask: (taskId: string, notes?: string, evidenceLink?: string) => Promise<void>;
}

export function ModuleTaskList({
  tasks,
  loading,
  error,
  onCompleteTask,
}: ModuleTaskListProps) {
  const [selectedTask, setSelectedTask] = useState<TaskProgressResponse | null>(null);
  const [notes, setNotes] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-3">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const handleOpenModal = (task: TaskProgressResponse) => {
    setSelectedTask(task);
    setNotes(task.employee_notes || '');
    setEvidenceLink(task.evidence_link || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      await onCompleteTask(selectedTask.task_id, notes, evidenceLink);
      setSelectedTask(null);
    } catch {
      // Handled upstream
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            Practical Tasks & Exercises ({tasks.length})
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Hands-on technical tasks required to validate operational competency.
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-800">
          {completedCount} of {tasks.length} Tasks Completed
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm">No practical tasks currently assigned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.task_id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {task.task_code}
                      </span>
                      <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-800/60 text-slate-300">
                        {task.due_stage.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm mt-1.5">
                      {task.description}
                    </h3>
                  </div>

                  {isCompleted ? (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                      <Clock className="w-3.5 h-3.5 mr-1" /> Pending
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 space-y-1 my-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                  <div><strong className="text-slate-200">Expected Outcome:</strong> {task.expected_outcome}</div>
                  <div><strong className="text-slate-200">Criteria:</strong> {task.completion_criteria}</div>
                </div>

                {task.employee_notes && (
                  <div className="text-xs text-slate-400 italic mb-2">
                    Notes: &quot;{task.employee_notes}&quot;
                  </div>
                )}

                {task.evidence_link && (
                  <div className="text-xs text-indigo-600 flex items-center gap-1 mb-3 truncate">
                    <LinkIcon className="w-3 h-3" />
                    <a href={task.evidence_link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      {task.evidence_link}
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400 capitalize">
                    Difficulty: <span className="font-semibold text-slate-400">{task.difficulty}</span>
                  </span>

                  {!isCompleted ? (
                    <button
                      onClick={() => handleOpenModal(task)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg inline-flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Submit & Complete
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenModal(task)}
                      className="px-2.5 py-1 text-slate-400 hover:text-slate-300 text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Notes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Completion Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              Complete Practical Task: {selectedTask.task_code}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedTask.description}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Submission Notes / Implementation Details
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe how you completed the task or verified requirements..."
                  className="w-full text-xs p-2.5 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Evidence Link / PR URL / Document Link (Optional)
                </label>
                <input
                  type="url"
                  value={evidenceLink}
                  onChange={(e) => setEvidenceLink(e.target.value)}
                  placeholder="https://github.com/company/repo/pull/123"
                  className="w-full text-xs p-2.5 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800/60 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Mark Task Completed
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
