import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { checkDirectInteractions, getReferenceMedications } from '../services/assessmentService';
import { SeverityBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const InteractionCheckerPage = () => {
  const [selectedMeds, setSelectedMeds] = useState(['Warfarin', 'Aspirin', 'Ibuprofen']);
  const [inputMed, setInputMed] = useState('');
  const [availableRefs, setAvailableRefs] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getReferenceMedications()
      .then((res) => {
        if (res.data?.success) setAvailableRefs(res.data.medications || []);
      })
      .catch(() => {});
  }, []);

  const handleAddMed = (drugName) => {
    const name = drugName || inputMed;
    if (!name || !name.trim()) return;
    const clean = name.trim();
    if (!selectedMeds.some((m) => m.toLowerCase() === clean.toLowerCase())) {
      setSelectedMeds([...selectedMeds, clean]);
    }
    setInputMed('');
  };

  const handleRemoveMed = (index) => {
    setSelectedMeds(selectedMeds.filter((_, i) => i !== index));
    setResults(null);
  };

  const handleCheck = async () => {
    if (selectedMeds.length < 2) {
      alert('Please add at least 2 medications to evaluate potential drug-drug interactions.');
      return;
    }

    try {
      setLoading(true);
      const res = await checkDirectInteractions(selectedMeds);
      if (res.data && res.data.success) {
        setResults(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing interaction check.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (presetList) => {
    setSelectedMeds(presetList);
    setResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Direct Drug Interaction & Duplication Checker</h1>
        <p className="text-xs text-slate-500 mt-1">
          Evaluate any combination of medications instantly against PharmaFog's verified clinical pharmacology rules
        </p>
      </div>

      {/* Presets and Medication Input */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        {/* Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-600 flex items-center mr-1">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
            Clinical Test Presets:
          </span>
          <button
            onClick={() => loadPreset(['Warfarin', 'Aspirin', 'Ibuprofen'])}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            Anticoagulant + Dual Antiplatelet/NSAID
          </button>
          <button
            onClick={() => loadPreset(['Lisinopril', 'Spironolactone', 'Potassium Chloride'])}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            Fatal Hyperkalemia Triad
          </button>
          <button
            onClick={() => loadPreset(['Sertraline', 'Tramadol', 'Lorazepam'])}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
          >
            Serotonin Syndrome & Sedative
          </button>
          <button
            onClick={() => loadPreset(['Ibuprofen', 'Naproxen', 'Acetaminophen'])}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            Therapeutic NSAID Duplication
          </button>
        </div>

        {/* Input box */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Enter medication generic name (e.g. Warfarin, Omeprazole, Digoxin, Metoprolol)..."
              value={inputMed}
              onChange={(e) => setInputMed(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMed();
                }
              }}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddMed()}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Drug</span>
          </button>
          <button
            type="button"
            onClick={handleCheck}
            disabled={loading || selectedMeds.length < 2}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <GitCompare className="w-4 h-4" />
            <span>{loading ? 'Evaluating...' : 'Check Interactions'}</span>
          </button>
        </div>

        {/* Selected Drugs Pills */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Selected Medications for Analysis ({selectedMeds.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedMeds.map((med, idx) => (
              <span
                key={idx}
                className="inline-flex items-center pl-3 pr-2 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold shadow-sm"
              >
                <span>{med}</span>
                <button
                  onClick={() => handleRemoveMed(idx)}
                  className="ml-2 p-0.5 rounded text-teal-500 hover:text-rose-600 hover:bg-teal-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <LoadingSpinner message="Checking pairs against verified interaction compendium..." />
      ) : results ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Banner */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Analysis Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated {results.totalChecked} medications • Found {results.interactionsFound} drug-drug interaction(s) and{' '}
                {results.duplicatesFound} duplicate warning(s).
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Pairs: {(results.totalChecked * (results.totalChecked - 1)) / 2}
              </span>
            </div>
          </div>

          {/* Duplicate Warnings */}
          {results.duplicates && results.duplicates.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-800">
                <Layers className="w-5 h-5 shrink-0" />
                <h4 className="text-sm font-bold">Duplicate Medication Warnings ({results.duplicates.length})</h4>
              </div>
              <div className="space-y-2">
                {results.duplicates.map((dup, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-amber-200/60 text-xs text-amber-900">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-800">{dup.type}: {(dup.medications || []).join(' & ')}</span>
                      <SeverityBadge severity={dup.severity} />
                    </div>
                    <p className="text-slate-600">{dup.description}</p>
                    <p className="text-amber-700 font-semibold mt-1">Suggested Action: {dup.clinicalAction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactions List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">
              Identified Drug-Drug Interactions ({results.interactions.length})
            </h3>

            {results.interactions.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No known interactions detected among selected medications.</p>
                <p className="text-slate-400 mt-0.5">Always verify novel combinations against clinical judgment.</p>
              </div>
            ) : (
              results.interactions.map((ddi, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <SeverityBadge severity={ddi.severity} />
                      <h4 className="text-sm font-bold text-slate-900">
                        {ddi.medicationA} <span className="text-slate-400 font-normal">+</span> {ddi.medicationB}
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                      {ddi.category || 'Pharmacological Interaction'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50">
                      <span className="font-bold text-slate-700 block mb-0.5">Pharmacological Mechanism:</span>
                      <p className="text-slate-600 leading-relaxed">{ddi.mechanism}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100">
                      <span className="font-bold text-rose-800 block mb-0.5">Clinical Adverse Effect:</span>
                      <p className="text-rose-950 leading-relaxed">{ddi.clinicalEffect}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-100 text-xs">
                    <span className="font-bold text-teal-900 block mb-0.5">Clinician Management Recommendation:</span>
                    <p className="text-teal-950 leading-relaxed">{ddi.recommendation}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reference: {ddi.source}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      {ddi.referenceStatus || 'Verified Clinical Reference'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
