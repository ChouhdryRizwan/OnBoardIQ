'use client';

import React, { useEffect, useState } from 'react';
import {
  DocumentMetadataResponse,
  DocumentChunkSchema,
  DocumentVersionSummaryResponse,
  fetchDocumentChunks,
  fetchDocumentVersions,
  activateDocumentVersion,
} from '@/lib/services/documentManagement';
import {
  X,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Layers,
  History,
  CheckCircle2,
  FileCode,
  Hash,
  Calendar,
  Building2,
  Tag,
  Loader2,
  Clock,
} from 'lucide-react';

interface DocumentDetailModalProps {
  document: DocumentMetadataResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshNeeded: () => void;
}

export function DocumentDetailModal({
  document,
  isOpen,
  onClose,
  onRefreshNeeded,
}: DocumentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'metadata' | 'security' | 'chunks' | 'versions'>('metadata');
  const [chunks, setChunks] = useState<DocumentChunkSchema[]>([]);
  const [versions, setVersions] = useState<DocumentVersionSummaryResponse[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [activatingVer, setActivatingVer] = useState<number | null>(null);

  useEffect(() => {
    if (!document || !isOpen) return;

    const docId = document.document_id;
    let isMounted = true;
    async function loadModalData() {
      setLoadingChunks(true);
      setLoadingVersions(true);

      try {
        const [cList, vList] = await Promise.all([
          fetchDocumentChunks(docId).catch(() => []),
          fetchDocumentVersions(docId).catch(() => []),
        ]);
        if (isMounted) {
          setChunks(cList);
          setVersions(vList);
        }
      } finally {
        if (isMounted) {
          setLoadingChunks(false);
          setLoadingVersions(false);
        }
      }
    }

    loadModalData();

    return () => {
      isMounted = false;
    };
  }, [document, isOpen]);

  if (!isOpen || !document) return null;

  const handleActivateVersion = async (ver: number) => {
    setActivatingVer(ver);
    setActionMessage(null);
    try {
      const resp = await activateDocumentVersion(document.document_id, ver);
      setActionMessage(resp.message);
      onRefreshNeeded();
      // Refetch version history
      const updatedVers = await fetchDocumentVersions(document.document_id);
      setVersions(updatedVers);
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : 'Failed to activate version');
    } finally {
      setActivatingVer(null);
    }
  };

  const isFlagged = document.adversarial_flags_count > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">{document.title}</h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800/60 text-slate-300">
                  {document.document_id}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  v{document.version}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">
                Category: {document.category.replace(/_/g, ' ')} • Department: {document.department || 'General'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-400 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'metadata'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Metadata Overview
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            {isFlagged ? (
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
            Security & Scan ({document.adversarial_flags_count})
          </button>

          <button
            onClick={() => setActiveTab('chunks')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'chunks'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Traceable Chunks ({chunks.length || document.total_chunks})
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'versions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            Version History ({versions.length || 1})
          </button>
        </div>

        {/* Action Message Alert */}
        {actionMessage && (
          <div className="mx-6 mt-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Modal Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: METADATA */}
          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/60">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
                  </div>
                  <div className="text-sm font-bold text-slate-100 mt-1 capitalize">
                    {document.category.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/60">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department
                  </div>
                  <div className="text-sm font-bold text-slate-100 mt-1">{document.department || 'General'}</div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/60">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Effective Date
                  </div>
                  <div className="text-sm font-bold text-slate-100 mt-1">{document.effective_date}</div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/60">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Expiry Date
                  </div>
                  <div className="text-sm font-bold text-slate-100 mt-1">{document.expiry_date || 'No Expiry Set'}</div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/60">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> File Format & Size
                  </div>
                  <div className="text-sm font-bold text-slate-100 mt-1 uppercase">
                    {document.file_format} ({(document.file_size_bytes / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/60">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-400" /> Precedence Rank
                  </div>
                  <div className="text-sm font-bold text-slate-100 mt-1">Rank {document.precedence_rank}</div>
                </div>
              </div>

              {/* SHA-256 Hash */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-indigo-600" /> Document Content SHA-256 Hash
                </div>
                <div className="font-mono text-xs text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-800">
                  {document.content_hash}
                </div>
              </div>

              {document.description && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-slate-400 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    {document.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SECURITY & SCAN */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {isFlagged ? (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Adversarial Instructions / Injection Flags Detected</h4>
                    <p className="text-xs text-amber-800 mt-1">
                      Automated security scan flagged {document.adversarial_flags_count} chunk(s) containing suspicious prompt injection patterns or instruction overrides embedded in the text.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">No Security Issues Detected</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Automated prompt injection scanner verified 100% clean status across all document sections.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRACEABLE CHUNKS INSPECTOR */}
          {activeTab === 'chunks' && (
            <div className="space-y-3">
              {loadingChunks ? (
                <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  Loading traceable chunks...
                </div>
              ) : chunks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No chunk data parsed for this version.</div>
              ) : (
                chunks.map((c) => (
                  <div
                    key={c.chunk_id}
                    className={`p-4 rounded-lg border text-xs space-y-2 ${
                      c.contains_adversarial_flag
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono font-semibold text-slate-100">
                        <span>Chunk #{c.chunk_index}</span>
                        <span>•</span>
                        <span>Sec: {c.section_id}</span>
                        {c.page_number && (
                          <>
                            <span>•</span>
                            <span>Page {c.page_number}</span>
                          </>
                        )}
                        {c.paragraph_reference && (
                          <>
                            <span>•</span>
                            <span>Para: {c.paragraph_reference}</span>
                          </>
                        )}
                      </div>

                      {c.contains_adversarial_flag ? (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-200 text-amber-900 rounded">
                          Adversarial Flag
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 rounded">
                          Clean
                        </span>
                      )}
                    </div>

                    {c.section_title && <div className="font-bold text-slate-200 text-xs">{c.section_title}</div>}

                    <div className="font-mono text-slate-300 bg-slate-900 p-3 rounded border border-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                      {c.chunk_text}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>Chunk ID: {c.chunk_id}</span>
                      <span>•</span>
                      <span>Tokens: {c.token_count || 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: VERSION HISTORY */}
          {activeTab === 'versions' && (
            <div className="space-y-3">
              {loadingVersions ? (
                <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  Loading version history...
                </div>
              ) : versions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No version history recorded.</div>
              ) : (
                versions.map((ver) => (
                  <div
                    key={ver.version}
                    className="p-4 rounded-lg border border-slate-800 bg-slate-950/50 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        Version {ver.version}
                        {ver.is_active && (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
                            Active Version
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span>Format: {ver.file_format.toUpperCase()}</span>
                        <span>•</span>
                        <span>Effective: {ver.effective_date}</span>
                        <span>•</span>
                        <span>Status: {ver.status}</span>
                      </div>
                    </div>

                    <div>
                      {!ver.is_active && (
                        <button
                          onClick={() => handleActivateVersion(ver.version)}
                          disabled={activatingVer === ver.version}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {activatingVer === ver.version ? 'Activating...' : 'Activate Version'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
