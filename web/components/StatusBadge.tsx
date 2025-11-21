import React from 'react';

export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    todo: 'bg-slate-100 text-slate-700',
    doing: 'bg-amber-100 text-amber-800',
    done: 'bg-emerald-100 text-emerald-800',
  };
  const cls = map[status] ?? 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}