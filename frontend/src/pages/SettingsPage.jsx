import React from 'react';
import { Settings, Shield, Sliders, Database, Server, Info } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Scoring Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review polypharmacy thresholds, ML engine endpoints, and regulatory clinical guardrails
        </p>
      </div>

      {/* Scoring Thresholds Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <Sliders className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Explainable Polypharmacy Scoring Model</h3>
            <p className="text-[11px] text-slate-500">Standardized clinical penalty weights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="font-bold text-slate-800">Polypharmacy Regimen Burden</span>
            <p className="text-slate-500">
              5 - 9 medications: <strong>+15 points</strong> (Baseline WHO Polypharmacy)<br />
              10+ medications: <strong>+25 points</strong> (Severe Hyperpolypharmacy)
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="font-bold text-slate-800">Drug-Drug Interaction Penalties</span>
            <p className="text-slate-500">
              Major Severity: <strong>+22 points per pair</strong><br />
              Moderate Severity: <strong>+10 points per pair</strong><br />
              Minor Severity: <strong>+3 points per pair</strong>
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="font-bold text-slate-800">Duplicate Medication Penalties</span>
            <p className="text-slate-500">
              Active Ingredient Duplication: <strong>+20 points</strong><br />
              Therapeutic Class Redundancy: <strong>+12 points</strong>
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <span className="font-bold text-slate-800">Allergy & Geriatric Flags</span>
            <p className="text-slate-500">
              Cross-Reactivity / Direct Allergy: <strong>+25 points</strong><br />
              AGS Beers Criteria (Age ≥65): <strong>+8 points per flagged agent</strong>
            </p>
          </div>
        </div>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center space-x-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Classification Tiers:</strong> Low Risk (0 - 24 points), Moderate Risk (25 - 49 points), High Risk (50 - 100 points).
          </span>
        </div>
      </div>

      {/* Microservice Endpoints Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <Server className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Microservice Topology & Endpoints</h3>
            <p className="text-[11px] text-slate-500">Local and production service configuration</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-bold text-slate-800">Core REST Backend API</p>
              <p className="text-slate-500 font-mono text-[11px]">http://localhost:5000/api</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-bold text-slate-800">Python ML Microservice (FastAPI + NetworkX)</p>
              <p className="text-slate-500 font-mono text-[11px]">http://localhost:8000/api</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-bold text-slate-800">Database Layer (MongoDB Service)</p>
              <p className="text-slate-500 font-mono text-[11px]">mongodb://127.0.0.1:27017/pharmafog</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
