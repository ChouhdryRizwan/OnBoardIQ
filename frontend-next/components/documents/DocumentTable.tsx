'use client';

import React from 'react';
import { DocumentMetadataResponse } from '@/lib/services/documentManagement';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Eye,
  RefreshCw,
  CheckCircle2,
  FileCode,
} from 'lucide-react';

interface DocumentTableProps {
  documents: DocumentMetadataResponse[];
  loading: boolean;
  onSelectDocument: (doc: DocumentMetadataResponse) => void;
  onReprocess: (doc: DocumentMetadataResponse) => void;
  onActivate: (doc: DocumentMetadataResponse) => void;
  actionInProgress?: string | null;
}

export function DocumentTable({
  documents,
  loading,
  onSelectDocument,
  onReprocess,
  onActivate,
  actionInProgress,
}: DocumentTableProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-800/60 rounded"></div>
          <div className="h-12 bg-slate-800/60 rounded"></div>
          <div className="h-12 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center shadow-sm">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-100 mb-1">No Documents Found</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          No company policy documents match your current filter criteria. Try clearing filters or upload a new document.
        </p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Document Details</th>
              <th className="py-3.5 px-4">Category / Dept</th>
              <th className="py-3.5 px-4">Version & Size</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Security Scan</th>
              <th className="py-3.5 px-4">Chunks</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {documents.map((doc) => {
              const isActive = doc.status.toLowerCase() === 'active';
              const isFlagged = doc.adversarial_flags_count > 0;
              const isProcessing = actionInProgress === doc.document_id;

              return (
                <tr key={`${doc.document_id}-v${doc.version}`} className="hover:bg-slate-950/80 transition-colors">
                  {/* Document ID & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          {doc.title}
                          <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                            {doc.document_id}
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{doc.description}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category & Department */}
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-medium text-slate-200 capitalize">
                      {doc.category.replace(/_/g, ' ')}
                    </div>
                    <div className="text-slate-400 mt-0.5">{doc.department || 'General'}</div>
                  </td>

                  {/* Version & Size */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <div className="font-semibold text-slate-100">v{doc.version}</div>
                    <div className="text-slate-400 mt-0.5">
                      {doc.file_format.toUpperCase()} • {formatFileSize(doc.file_size_bytes)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-800/60 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {doc.status}
                    </span>
                  </td>

                  {/* Security Scan */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isFlagged ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        {doc.adversarial_flags_count} Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Clean
                      </span>
                    )}
                  </td>

                  {/* Chunks */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-md">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      {doc.total_chunks} Chunks
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                        title="Inspect metadata, chunks, and versions"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>

                      <button
                        onClick={() => onReprocess(doc)}
                        disabled={isProcessing}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-800/60 rounded-lg transition-colors disabled:opacity-50"
                        title="Reprocess & re-chunk version"
                      >
                        <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                      </button>

                      {!isActive && (
                        <button
                          onClick={() => onActivate(doc)}
                          disabled={isProcessing}
                          className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          title="Activate this version"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
