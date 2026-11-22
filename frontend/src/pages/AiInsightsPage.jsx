import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  User,
  Pill,
  BookOpen,
  Info,
  CheckCircle2
} from 'lucide-react';
import { getPatients, getPatientById } from '../services/patientService';
import { askPatientAI } from '../services/aiService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RiskBadge } from '../components/common/Badge';

export const AiInsightsPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    getPatients()
      .then((res) => {
        if (res.data?.success && res.data.patients?.length > 0) {
          setPatients(res.data.patients);
          setSelectedPatientId(res.data.patients[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedPatientId) return;
    setLoadingPatient(true);
    getPatientById(selectedPatientId)
      .then((res) => {
        if (res.data?.success) {
          setPatientData(res.data);
          // Set initial welcome message
          const pName = res.data.patient.fullName;
          const medCount = (res.data.medications || []).filter((m) => m.status === 'Active').length;
          setMessages([
            {
              sender: 'ai',
              text: `Hello, Doctor. I am the PharmaFog Clinical AI Assistant. I have loaded ${pName}'s profile (${medCount} active medications). You can ask me about drug interactions, duplicate ingredients, required laboratory tests, or request a simplified explanation for patient counseling.`,
              timestamp: new Date()
            }
          ]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingPatient(false));
  }, [selectedPatientId]);

  const handleSend = async (questionText) => {
    const q = questionText || inputQuestion;
    if (!q || !q.trim() || !selectedPatientId) return;

    const userMsg = { sender: 'user', text: q, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setAsking(true);

    try {
      const res = await askPatientAI(selectedPatientId, q);
      if (res.data && res.data.success) {
        const aiMsg = {
          sender: 'ai',
          text: res.data.data.answer,
          sources: res.data.data.evidence_sources,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to retrieve clinical answer at this time. Please verify patient data.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setAsking(false);
    }
  };

  const sampleQuestions = [
    'Why is Warfarin + Aspirin dangerous in this patient?',
    'What laboratory monitoring is recommended?',
    'Are there duplicate medications in this regimen?',
    'Explain the polypharmacy risks in simple terms for the patient'
  ];

  const p = patientData?.patient;
  const meds = (patientData?.medications || []).filter((m) => m.status === 'Active');
  const latestAsm = patientData?.latestAssessment;
  const insights = latestAsm?.aiInsights || {};

  return (
    <div className="space-y-6">
      {/* Header and Patient Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Clinical Insights & Regimen Q&A</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Deterministic Guardrails Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded pharmacological synthesis and interactive clinician decision-support dialog
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white font-semibold"
          >
            {patients.map((pt) => (
              <option key={pt._id} value={pt._id}>
                {pt.fullName} ({pt.patientId}) - {pt.riskStatus}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingPatient ? (
        <LoadingSpinner message="Loading patient regimen and AI reasoning context..." />
      ) : p ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Structured Regimen Summary & Verification Flags */}
          <div className="lg:col-span-5 space-y-4">
            {/* Patient Context Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{p.fullName}</h3>
                  <p className="text-[11px] text-slate-500">{p.age}y • {p.sex} • {p.patientId}</p>
                </div>
                <RiskBadge risk={p.riskStatus} />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active Prescriptions ({meds.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {meds.map((m) => (
                    <span key={m._id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {m.genericName} ({m.dosage})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Executive Summary */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-teal-700">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">AI Regimen Synthesis</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {insights.executiveSummary ||
                  `${p.fullName} is prescribed ${meds.length} concurrent medications. The polypharmacy profile shows potential drug-drug collisions and therapeutic redundancies requiring clinical surveillance.`}
              </p>
            </div>

            {/* Clinician Verification Flags */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-slate-800">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Clinician Verification Flags</h4>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                  <span>Verify adherence: Confirm patient is not taking unrecorded OTC NSAIDs or analgesics.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                  <span>Laboratory verification: Check recent renal function (eGFR/Cr) and serum potassium.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                  <span>Counseling point: Instruct patient on early warning signs of bleeding and hypotension.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Chat Interface */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">PharmaFog Clinical Regimen Q&A</h3>
                  <p className="text-[10px] text-slate-400">Strictly grounded in patient's active prescriptions</p>
                </div>
              </div>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono border border-teal-200">
                Safe CDS Mode
              </span>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-lg rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center space-x-1">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        <span>Sources: {m.sources.filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    <span className="text-[9px] text-slate-400 mt-1 block text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {asking && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 py-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>Evaluating clinical pharmacological graphs...</span>
                </div>
              )}
            </div>

            {/* Quick Suggested Questions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Suggested Inquiries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleQuestions.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sq)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors text-left"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask about interactions, lab monitoring, or deprescribing rationale..."
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
              <button
                onClick={() => handleSend()}
                disabled={asking || !inputQuestion.trim()}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
