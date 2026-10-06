import React from 'react';
import { Card } from '../../ui/Card';

export interface ColumnDef {
  header: string;
  accessorKey: string;
}

export interface DataTablePlaceholderProps {
  title: string;
  subtitle?: string;
  columns: ColumnDef[];
  rows?: Record<string, string | number | React.ReactNode>[];
  emptyText?: string;
}

export const DataTablePlaceholder: React.FC<DataTablePlaceholderProps> = ({
  title,
  subtitle,
  columns,
  rows = [],
  emptyText = 'No items found in dataset.',
}) => {
  return (
    <Card className="bg-slate-900 border-slate-800 p-5 shadow-lg overflow-hidden">
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h3 className="text-base font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              {columns.map((col) => (
                <th key={col.accessorKey} className="py-3 px-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {rows.length > 0 ? (
              rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  {columns.map((col) => (
                    <td key={col.accessorKey} className="py-3 px-4">
                      {row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-400">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
