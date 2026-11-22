import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  AlertTriangle,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Share2,
  Printer,
  Layers,
  Activity,
  HeartPulse,
  Info
} from 'lucide-react';
import { getAssessmentById, updateChecklistItem } from '../services/assessmentService';
import { exportAssessmentPDF } from '../services/pdfExport';
import { RiskBadge, SeverityBadge } from '../components/common/Badge';
import { RiskIndicator } from '../components/common/RiskIndicator';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AssessmentResultPage = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const res = await getAssessmentById(id);
        if (res.data && res.data.success) {
          setAssessment(res.data.assessment);
          setChecklist(res.data.assessment.clinicianChecklist || []);
        }
      } catch (err) {
        console.error('[Assessment Fetch Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleToggleChecklist = async (itemId) => {
    const current = checklist.find((c) => c.id === itemId);
    if (!current) return;
    const nextState = !current.completed;

    // Optimistic update
    setChecklist((prev) =>
      prev.map((c) => (c.id === itemId ? { ...c, completed: nextState } : c))
    );

    try {
      await updateChecklistItem(assessment._id, itemId, nextState);
    } catch (err) {
      console.error('[Update Checklist Error]', err);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating explainable polypharmacy report..." size="lg" />;
  }

  if (!assessment) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Assessment record not found.</p>
        <Link to="/reports" className="text-teal-600 font-semibold mt-2 inline-block">
          View All Reports
        </Link>
      </div>
    );
  }

  const p = assessment.patientSnapshot || {};
  const risk = assessment.riskAnalysis || {};
  const interactions = assessment.interactionsDetected || [];
  const duplicates = assessment.duplicatesDetected || [];
  const meds = assessment.medicationsSnapshot || [];
  const factors = risk.factors || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to={`/patients/${assessment.patient?._id || assessment.patient}`}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">Polypharmacy Assessment Report</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-teal-700 font-bold border border-slate-200">
                {assessment.assessmentId}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated on {new Date(assessment.createdAt).toLocaleString()} • Evaluator:{' '}
              {assessment.conductedBy?.name || 'Attending Physician'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportAssessmentPDF(assessment)}
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Download Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Patient & Assessment Snapshot */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{p.fullName}</p>
            <p className="text-[11px] text-teal-600 font-mono font-semibold">{p.patientId}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age / Sex / Weight</span>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">
              {p.age} years • {p.sex} • {p.weight ? `${p.weight} kg` : 'Weight N/A'}
            </p>
            <p className="text-[11px] text-slate-500">
              {p.age >= 65 ? 'Geriatric Beers Criteria Active' : 'Adult Cohort'}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documented Allergies</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {p.allergies && p.allergies.length > 0 ? (
                p.allergies.map((a, i) => (
                  <span key={i} className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200">
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">None recorded</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prescriptions Analyzed</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{meds.length} Active Medications</p>
            <p className="text-[11px] text-slate-500">{interactions.length} Interactions • {duplicates.length} Duplications</p>
          </div>
        </div>
      </div>

      {/* Risk Score & Explainable Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Gauge Card */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Overall Safety Risk Index</h3>
          <RiskIndicator score={risk.score} level={risk.riskLevel} size="lg" />

          <div className="p-3.5 rounded-lg bg-slate-50 text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700 block mb-1">Clinical Interpretation:</span>
            {risk.summaryStatement || 'Clinical monitoring and medication reconciliation recommended.'}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Deterministic scoring model. Evaluated against weighted pharmacologic hazards.</span>
          </div>
        </div>

        {/* Explainable Factor Breakdown (Why this score?) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Explainable Scoring Factors</h3>
            <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">SHAP-Style Factor Weights</span>
          </div>

          <div className="space-y-3">
            {factors.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No risk penalties applied.</p>
            ) : (
              factors.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{f.factor}</span>
                    <span className="font-mono font-bold text-teal-700">+{f.points} pts ({f.percentage || 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (f.percentage || 10) * 1.5)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{f.detail}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interactive Clinician Review Checklist */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Interactive Clinician Action Checklist ({checklist.filter((c) => c.completed).length} / {checklist.length} Completed)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click to verify clinical follow-up actions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleChecklist(item.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                item.completed
                  ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-75'
                  : item.priority === 'Immediate' || item.priority === 'High'
                  ? 'bg-rose-50/50 border-rose-200 text-slate-800 hover:border-rose-300'
                  : 'bg-teal-50/30 border-teal-200 text-slate-800 hover:border-teal-300'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 hover:text-teal-600 transition-colors shrink-0"
              >
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      item.priority === 'Immediate'
                        ? 'bg-rose-100 text-rose-700'
                        : item.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.category}</span>
                </div>
                <p className={`font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {item.action}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.rationale}</p>
                {item.completed && item.completedBy && (
                  <span className="text-[10px] text-teal-600 font-medium block mt-1">
                    Verified by {item.completedBy}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Potential Drug Interactions Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">
          Detected Drug-Drug Interactions ({interactions.length})
        </h3>

        {interactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            <ShieldCheck className="w-8 h-8 text-teal-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No drug-drug interaction conflicts flagged.</p>
          </div>
        ) : (
          interactions.map((ddi, i) => (
            <div
              key={i}
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

      {/* Duplicate Medication Warnings */}
      {duplicates.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-800">
            <Layers className="w-5 h-5 shrink-0" />
            <h4 className="text-sm font-bold">Duplicate Medication Warnings ({duplicates.length})</h4>
          </div>
          <div className="space-y-2">
            {duplicates.map((dup, i) => (
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

      {/* Active Medication Regimen Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Active Regimen Profile Analyzed ({meds.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Medication</th>
                <th className="py-3 px-4">Dosage</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Drug Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {meds.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{m.genericName}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{m.dosage}</td>
                  <td className="py-3 px-4 text-slate-600">{m.frequency}</td>
                  <td className="py-3 px-4 text-slate-600">{m.route || 'Oral'}</td>
                  <td className="py-3 px-4 text-slate-600">{m.drugClass || 'General'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
