'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface Pipeline1WarningsProps {
  errorLog?: string | null;
  warningMessage?: string | null;
}

export function Pipeline1Warnings({ errorLog, warningMessage }: Pipeline1WarningsProps) {
  if (!errorLog && !warningMessage) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs text-amber-900 space-y-2">
      <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        Generation Warnings & Execution Alert
      </div>

      {warningMessage && <p>{warningMessage}</p>}

      {errorLog && (
        <div className="p-3 bg-slate-900/80 rounded border border-amber-200 font-mono text-[11px] text-amber-900 break-all">
          {errorLog}
        </div>
      )}
    </div>
  );
}
