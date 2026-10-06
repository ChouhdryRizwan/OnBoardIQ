'use client';

import React from 'react';
import { DocumentMetadataResponse } from '@/lib/services/documentManagement';
import { FileText, ShieldCheck, ShieldAlert } from 'lucide-react';

interface Pipeline1SourceContextProps {
  referencedDocIds: string[];
  allDocuments: DocumentMetadataResponse[];
  loading: boolean;
}

export function Pipeline1SourceContext({
  referencedDocIds,
  allDocuments,
  loading,
}: Pipeline1SourceContextProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  // Filter documents matching referenced doc IDs
  const matchedDocs = allDocuments.filter((d) =>
    referencedDocIds.some((refId) => refId.toLowerCase() === d.document_id.toLowerCase())
  );

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Referenced Source Policy Documents ({referencedDocIds.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active company documents serving as text citations for this role&apos;s requirements
          </p>
        </div>
      </div>

      {referencedDocIds.length === 0 ? (
        <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
          No source policy documents referenced by the current requirement matrix.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {referencedDocIds.map((docId) => {
            const docObj = matchedDocs.find((d) => d.document_id.toLowerCase() === docId.toLowerCase());
            const title = docObj?.title || `Document ${docId}`;
            const version = docObj?.version || 1;
            const category = docObj?.category || 'policy';
            const isFlagged = docObj ? docObj.adversarial_flags_count > 0 : false;

            return (
              <div
                key={docId}
                className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      {docId}
                    </span>
                    <span className="line-clamp-1">{title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 capitalize">
                    v{version} • {category.replace(/_/g, ' ')}
                  </div>
                </div>

                {isFlagged ? (
                  <span className="p-1 rounded bg-amber-100 text-amber-800 shrink-0" title="Security scan flags present">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                  </span>
                ) : (
                  <span className="p-1 rounded bg-emerald-100 text-emerald-800 shrink-0" title="Clean security scan">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
