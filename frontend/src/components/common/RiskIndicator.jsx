import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';

export const RiskIndicator = ({ score = 0, level = 'Low Risk', size = 'md' }) => {
  const normLevel = (level || '').toLowerCase();
  let barColor = 'bg-teal-500';
  let textColor = 'text-teal-700';
  let bgColor = 'bg-teal-50';
  let borderColor = 'border-teal-200';
  let Icon = ShieldCheck;

  if (normLevel.includes('high')) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-700';
    bgColor = 'bg-rose-50';
    borderColor = 'border-rose-200';
    Icon = AlertOctagon;
  } else if (normLevel.includes('mod')) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-200';
    Icon = AlertTriangle;
  }

  const safeScore = Math.min(100, Math.max(0, score || 0));

  if (size === 'sm') {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${safeScore}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-700">{safeScore}/100</span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${borderColor} ${bgColor} flex items-start space-x-3.5`}>
      <div className={`p-2 rounded-lg bg-white shadow-sm shrink-0 ${textColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-bold uppercase tracking-wider ${textColor}`}>
            {level}
          </h4>
          <span className="text-sm font-extrabold text-slate-800">
            {safeScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </span>
        </div>
        <div className="w-full bg-white/80 rounded-full h-2.5 mt-2 overflow-hidden border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${safeScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Low (0-24)</span>
          <span>Moderate (25-49)</span>
          <span>High (50+)</span>
        </div>
      </div>
    </div>
  );
};
