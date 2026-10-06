'use client';

import React from 'react';
import { FileText, RefreshCw, Upload, Shield } from 'lucide-react';

interface DocumentLibraryHeaderProps {
  onRefresh: () => void;
  onOpenUpload: () => void;
  loading: boolean;
  totalCount: number;
}

export function DocumentLibraryHeader({
  onRefresh,
  onOpenUpload,
  loading,
  totalCount,
}: DocumentLibraryHeaderProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-100">Document Management Workspace</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              RBAC Protected
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Upload, inspect, parse, and version company policy documents, SOPs, and handbooks for OnBoardIQ processing. ({totalCount} indexed)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh document list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
}
