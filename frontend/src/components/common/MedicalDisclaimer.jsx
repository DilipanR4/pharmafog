import React from 'react';
import { Info } from 'lucide-react';

export const MedicalDisclaimer = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-slate-100 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-600 flex items-center space-x-2">
        <Info className="w-4 h-4 text-teal-600 shrink-0" />
        <span>
          <strong>Clinical Decision Support Notice:</strong> PharmaFog assists healthcare professionals in identifying medication safety concerns. Not an autonomous diagnostic or prescribing tool.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 to-navy-900 text-white rounded-xl p-4 shadow-sm border border-slate-700/60 flex items-start space-x-3.5 my-4">
      <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 shrink-0">
        <Info className="w-5 h-5" />
      </div>
      <div className="text-xs text-slate-300 leading-relaxed">
        <h5 className="font-semibold text-white mb-0.5 flex items-center">
          Clinical Decision Support Prototype Disclaimer
          <span className="ml-2 px-1.5 py-0.2 bg-teal-500/30 text-teal-200 text-[10px] rounded uppercase font-mono">Verified + Demo Data</span>
        </h5>
        PharmaFog is engineered to identify potential polypharmacy drug-drug interactions, duplicate therapeutic categories, and medication risks from structured reference models. Never start, discontinue, or alter drug dosages without direct review by a qualified physician or clinical pharmacist.
      </div>
    </div>
  );
};
