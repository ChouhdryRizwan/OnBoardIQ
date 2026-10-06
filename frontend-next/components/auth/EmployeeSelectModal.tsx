'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Search, X, User, ChevronRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export interface EmployeeDirectoryItem {
  employee_id: string;
  employee_code: string;
  user_id?: string | null;
  name: string;
  email: string;
  job_role_id?: string;
  role_code?: string;
  role_title?: string;
  department?: string;
  experience_level?: string;
  location?: string | null;
  joining_date?: string;
  training_status?: string;
  is_active?: boolean;
}

interface EmployeeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmployee: (employee: EmployeeDirectoryItem) => void;
}

export function EmployeeSelectModal({
  isOpen,
  onClose,
  onSelectEmployee,
}: EmployeeSelectModalProps) {
  const [employees, setEmployees] = useState<EmployeeDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<EmployeeDirectoryItem[]>('/api/employees');
        if (isMounted) {
          // Filter to active employees
          const activeOnly = data.filter((e) => e.is_active !== false);
          setEmployees(activeOnly);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load employee directory.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEmployees();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.employee_code.toLowerCase().includes(q) ||
        (e.role_title && e.role_title.toLowerCase().includes(q)) ||
        (e.role_code && e.role_code.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q)) ||
        e.email.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Select Active Employee Account
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  {employees.length} Available
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Log in dynamically as any seeded employee to view their isolated onboarding roadmap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, employee code (EMP-...), role, or department..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Employee List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-800/40">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs">Loading seeded employee directory...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No employees found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const roleDisplay = emp.role_title || emp.role_code || 'General Staff';
              const isEval10 = emp.employee_code === 'EMP-EVAL-010';

              return (
                <button
                  key={emp.employee_id}
                  onClick={() => onSelectEmployee(emp)}
                  className={`w-full pt-2 pb-2 px-3 text-left rounded-xl transition-all flex items-center justify-between group hover:bg-slate-800/70 border border-transparent hover:border-slate-700/80 ${
                    isEval10 ? 'bg-emerald-950/20 border-emerald-800/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs shrink-0 group-hover:border-emerald-500 group-hover:text-emerald-400 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {emp.name}
                        </span>
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {emp.employee_code}
                        </span>
                        {isEval10 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold">
                            Verified Plan
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        <span className="text-emerald-400 font-medium">{roleDisplay}</span>
                        <span className="mx-1.5 text-slate-600">•</span>
                        <span>{emp.department || 'Operations'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[11px] text-slate-400 group-hover:text-emerald-300 font-medium transition-colors">
                      Log In
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-500">
          <span>
            Selecting an employee automatically sets <code className="text-slate-400 font-mono">X-User-Id</code> and <code className="text-slate-400 font-mono">X-User-Role: employee</code>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
