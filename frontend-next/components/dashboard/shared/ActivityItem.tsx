import React from 'react';
import { Badge } from '../../ui/Badge';

export interface ActivityItemProps {
  timestamp: string;
  user: string;
  action: string;
  status?: string;
  statusVariant?: 'indigo' | 'emerald' | 'amber' | 'error' | 'neutral';
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  timestamp,
  user,
  action,
  status,
  statusVariant = 'indigo',
}) => {
  return (
    <div className="flex items-start justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white">{user}</span>
          <span className="text-[10px] text-slate-400 font-mono">{timestamp}</span>
        </div>
        <p className="text-slate-400 leading-normal">{action}</p>
      </div>

      {status && (
        <Badge variant={statusVariant} className="text-[10px] shrink-0">
          {status}
        </Badge>
      )}
    </div>
  );
};
