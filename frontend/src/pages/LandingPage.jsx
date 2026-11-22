import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  FileText,
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Database,
  Users,
  GitBranch,
  Stethoscope
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20 font-bold">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-wider text-white">PHARMAFOG</span>
              <span className="block text-[10px] text-teal-400 font-medium tracking-wider">MEDICATION SAFETY PLATFORM</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            <a href="#polypharmacy" className="hover:text-teal-400 transition-colors">What is Polypharmacy?</a>
            <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-teal-400 transition-colors">Clinical Workflow</a>
            <a href="#safety" className="hover:text-teal-400 transition-colors">AI Safety</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all shadow-md shadow-teal-500/20 flex items-center space-x-1.5"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Clinical Decision Support</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-sky-400">Polypharmacy Detection</span> & Medication Safety
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                PharmaFog evaluates multi-medication regimens, detects severe drug-drug interactions, flags duplicate therapeutic categories, and delivers transparent, explainable clinical safety reports for healthcare professionals.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2"
                >
                  <span>Launch Interactive Prototype</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm transition-colors text-center"
                >
                  Register Clinician Account
                </Link>
              </div>

              {/* Demo accounts preview */}
              <div className="pt-4 flex items-center justify-center lg:justify-start space-x-4 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Instant Demo:</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-teal-300">doctor@pharmafog.health</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-teal-300">Doctor@123</span>
              </div>
            </div>

            {/* Medical Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">High Risk Polypharmacy Flag</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Eleanor Vance (74y)</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-rose-300">Major Interaction: Warfarin + Aspirin + Ibuprofen</p>
                      <p className="text-slate-400 mt-1">Synergistic platelet and clotting factor suppression. Severe gastrointestinal hemorrhage hazard.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-amber-300">Major Interaction: Lisinopril + Spironolactone</p>
                      <p className="text-slate-400 mt-1">Renal potassium clearance collision. Critical hyperkalemia warning.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-900/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-teal-300">Explainable Safety Index</p>
                      <p className="text-[10px] text-slate-400">Scored across 6 weighted clinical dimensions</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-rose-400">85</span>
                      <span className="text-xs text-slate-500"> / 100</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Clinical Decision Support Only</span>
                  </span>
                  <span>FastAPI + NetworkX ML</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Polypharmacy Section */}
      <section id="polypharmacy" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Understanding The Challenge</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">What is Polypharmacy?</h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Polypharmacy is the concurrent use of five or more medications by a single patient. While often clinically necessary for individuals with multiple chronic diseases, polypharmacy drastically multiplies the risk of adverse drug events, drug collisions, hospitalization, and cognitive decline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Adverse Drug Collisions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                As the number of medications rises from 5 to 10, the mathematical probability of drug-drug interactions escalates from 50% to nearly 100%.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Therapeutic Duplication</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Patients visiting multiple specialists frequently end up with duplicate active ingredients or concurrent drugs from identical therapeutic classes without realization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Geriatric Vulnerability</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Age-related declines in hepatic metabolism and renal clearance amplify susceptibility to sedation, falls, delirium, and gastrointestinal ulceration under Beers Criteria medications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section id="features" className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Platform Capabilities</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Engineered for Medication Safety</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              PharmaFog integrates multi-layered clinical algorithms into a single intuitive interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
              <GitBranch className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="text-sm font-bold text-white">Pairwise Interaction Graph</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Constructs a network interaction graph for the entire regimen using NetworkX, identifying central conflict hubs and classifying severity as Major, Moderate, or Minor.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
              <Layers className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="text-sm font-bold text-white">Duplicate Active Ingredient Detection</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Catches repeated chemical entities (e.g., Tylenol + Paracetamol) and therapeutic class redundancy across NSAIDs, PPIs, benzodiazepines, and ACE inhibitors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
              <ShieldCheck className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="text-sm font-bold text-white">Explainable Risk Scoring</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                No black-box guesses. Shows exactly how many points and percentages each clinical factor contributed to the final safety rating (High, Moderate, Low).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
              <Sparkles className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="text-sm font-bold text-white">Grounded AI Clinical Summaries</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Translates complex pharmacological mechanisms into clear, patient-friendly guidance and clinician checklists without hallucinating unverified interactions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
              <FileText className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="text-sm font-bold text-white">Instant PDF Clinical Reports</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Generates hospital-grade, audit-ready clinical PDF reports with patient snapshot, active medications table, interaction badges, and review checklists.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
              <Database className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="text-sm font-bold text-white">Modular Reference Knowledgebase</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Seeded with 30 realistic medications and 28 verified drug interaction rules, architected to scale into live RxNorm, DrugBank, and FDA datasets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Workflow */}
      <section id="workflow" className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-teal-400 uppercase tracking-widest">End-to-End Execution</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">How PharmaFog Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-14">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-teal-500/30">01</span>
              <h4 className="text-sm font-bold text-white mt-2">Patient Intake</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Select an existing patient profile or register a new patient with age, allergies, and clinical conditions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-teal-500/30">02</span>
              <h4 className="text-sm font-bold text-white mt-2">Medication Reconciliation</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Input the patient's multi-drug regimen with dosages, frequencies, routes, and active chemical ingredients.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-teal-500/30">03</span>
              <h4 className="text-sm font-bold text-white mt-2">AI Polypharmacy Evaluation</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Click Analyze. The engine evaluates drug-drug pairs, duplicate ingredients, allergy conflicts, and Beers criteria.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 relative">
              <span className="text-3xl font-extrabold text-teal-500/30">04</span>
              <h4 className="text-sm font-bold text-white mt-2">Actionable Safety Report</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Review explainable score breakdown, complete clinician checklist, and export official PDF clinical report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice */}
      <section id="safety" className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white">Commitment to Clinical Decision Support Safety</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            PharmaFog is designed as an assistive tool for doctors, pharmacists, and medical teams. It does not replace qualified clinical judgment, does not issue autonomous prescriptions, and clearly distinguishes verified reference data from AI explanations.
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-teal-500/20"
            >
              Start Evaluating Regimens Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white">PHARMAFOG</span> © 2026. Clinical Medication Safety Platform.
          </div>
          <div className="text-[11px] text-slate-400">
            Engineered for clinical decision support. Demonstration prototype.
          </div>
        </div>
      </footer>
    </div>
  );
};
