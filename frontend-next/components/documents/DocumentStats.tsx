'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { DocumentMetadataResponse } from '@/lib/services/documentManagement';
import { FileText, CheckCircle2, ShieldAlert, Layers, AlertCircle, RefreshCw } from 'lucide-react';

interface DocumentStatsProps {
  documents: DocumentMetadataResponse[];
  loading: boolean;
}

export function DocumentStats({ documents, loading }: DocumentStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 p-5 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-1/2 mb-3" />
            <div className="h-7 bg-slate-800 rounded w-3/4 mb-2" />
            <div className="h-2 bg-slate-800 rounded w-1/3" />
          </Card>
        ))}
      </div>
    );
  }

  const total = documents.length;
  const activeCount = documents.filter((d) => d.status.toLowerCase() === 'active').length;
  const totalChunks = documents.reduce((acc, curr) => acc + (curr.total_chunks || 0), 0);
  const securityFlagsCount = documents.reduce((acc, curr) => acc + (curr.adversarial_flags_count || 0), 0);
  const completedProcessing = documents.filter((d) => d.processing_status.toLowerCase() === 'completed').length;
  const obsoleteCount = documents.filter((d) => d.status.toLowerCase() === 'obsolete').length;

  const stats = [
    {
      title: 'TOTAL DOCUMENTS',
      value: total,
      subtitle: 'Ingested policy SOP manuals',
      icon: FileText,
      color: 'border-l-indigo-500',
    },
    {
      title: 'ACTIVE KNOWLEDGE',
      value: activeCount,
      subtitle: 'Currently active & indexed documents',
      icon: CheckCircle2,
      color: 'border-l-emerald-500',
    },
    {
      title: 'INDEXED CHUNKS',
      value: totalChunks,
      subtitle: 'Vector-embedded knowledge chunks',
      icon: Layers,
      color: 'border-l-sky-500',
    },
    {
      title: 'SECURITY FLAGS',
      value: securityFlagsCount,
      subtitle: securityFlagsCount > 0 ? 'Detected adversarial prompt risks' : 'Zero adversarial flags detected',
      icon: ShieldAlert,
      color: 'border-l-rose-500',
    },
    {
      title: 'PROCESSED STATUS',
      value: `${completedProcessing}/${total}`,
      subtitle: 'Fully parsed & vectorized documents',
      icon: RefreshCw,
      color: 'border-l-purple-500',
    },
    {
      title: 'OBSOLETE VERSIONS',
      value: obsoleteCount,
      subtitle: 'Archived & superseded document versions',
      icon: AlertCircle,
      color: 'border-l-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((st) => {
        const Icon = st.icon;
        return (
          <Card key={st.title} className={`bg-slate-900 border-slate-800 border-l-4 ${st.color} p-5 shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{st.title}</span>
              <Icon className="w-5 h-5 text-slate-400" />
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{st.value}</div>
            <p className="text-xs text-slate-400 mt-1 truncate">{st.subtitle}</p>
          </Card>
        );
      })}
    </div>
  );
}
