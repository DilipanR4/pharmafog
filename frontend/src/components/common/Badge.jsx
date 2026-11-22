import React from 'react';

export const RiskBadge = ({ risk, size = 'sm' }) => {
  const norm = (risk || '').toLowerCase();
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  if (norm.includes('high')) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    dot = 'bg-rose-500';
  } else if (norm.includes('mod')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
  } else if (norm.includes('low')) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dot = 'bg-emerald-500';
  }

  const px = size === 'lg' ? 'px-3.5 py-1 text-sm' : size === 'md' ? 'px-2.5 py-0.5 text-xs' : 'px-2 py-0.5 text-[11px]';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${bg} ${px}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dot}`} />
      {risk || 'Not Evaluated'}
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const norm = (severity || '').toLowerCase();
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm === 'major' || norm === 'critical') {
    bg = 'bg-red-50 text-red-700 border-red-200 font-semibold';
  } else if (norm === 'moderate') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm === 'minor') {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border ${bg}`}>
      {severity}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const active = status === 'Active';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${
      active
        ? 'bg-teal-50 text-teal-700 border-teal-200'
        : 'bg-slate-100 text-slate-600 border-slate-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-teal-500' : 'bg-slate-400'}`} />
      {status || 'Active'}
    </span>
  );
};
