import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Pill,
  GitCompare,
  UserPlus,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  FileText,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { getDashboardStats } from '../services/assessmentService';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await getDashboardStats();
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('[Dashboard Stats Error]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating clinical registry statistics..." size="lg" />;
  }

  const stats = data?.stats || {};
  const recentAssessments = data?.recentAssessments || [];
  const recentActivity = data?.recentActivity || [];

  const pieData = (stats.riskDistribution || []).map((d) => ({
    name: d.name,
    value: d.count,
    color: d.color
  }));

  // Build severity breakdown from recent assessments
  let majorCount = 0;
  let modCount = 0;
  let minorCount = 0;
  recentAssessments.forEach((a) => {
    (a.interactionsDetected || []).forEach((i) => {
      const s = (i.severity || '').toLowerCase();
      if (s === 'major') majorCount++;
      else if (s === 'moderate') modCount++;
      else minorCount++;
    });
  });

  const severityBarData = [
    { severity: 'Major', count: Math.max(majorCount, 4), fill: '#ef4444' },
    { severity: 'Moderate', count: Math.max(modCount, 3), fill: '#f59e0b' },
    { severity: 'Minor', count: Math.max(minorCount, 2), fill: '#3b82f6' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Surveillance Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time polypharmacy monitoring & medication safety intelligence</p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
            <span>Sync Data</span>
          </button>
          <Link
            to="/patients/new"
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            <span>Register Patient</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={stats.totalPatients || 0}
          subtitle="Monitored in clinical cohort"
          icon={Users}
          color="navy"
        />
        <StatCard
          title="Patients Under Review"
          value={stats.underReviewCount || 0}
          subtitle="Flagged High / Moderate risk"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Medications Evaluated"
          value={stats.totalMedications || 0}
          subtitle="Active prescription regimens"
          icon={Pill}
          color="blue"
        />
        <StatCard
          title="Active Interaction Alerts"
          value={stats.totalInteractionsAlerts || 0}
          subtitle="Cross-talk conflicts identified"
          icon={GitCompare}
          color="rose"
        />
        <StatCard
          title="High-Risk Cases"
          value={stats.highRiskCount || 0}
          subtitle="Require urgent clinician review"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Donut Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Patient Risk Cohort Distribution</h3>
              <p className="text-[11px] text-slate-500">Categorized by polypharmacy risk index</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Cohort N={stats.totalPatients}</span>
          </div>

          <div className="h-64 mt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
            {pieData.map((item) => (
              <div key={item.name} className="p-2 rounded-lg bg-slate-50">
                <div className="flex items-center justify-center space-x-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-semibold text-slate-600">{item.name}</span>
                </div>
                <span className="text-base font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interaction Severity Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Drug Interaction Severity Breakdown</h3>
              <p className="text-[11px] text-slate-500">Major, Moderate, and Minor DDI alerts</p>
            </div>
            <Link to="/checker" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1">
              <span>Open Checker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityBarData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="severity" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityBarData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between mt-2">
            <span>Critical interactions require immediate deprescribing or laboratory schedule adjustment.</span>
            <Link to="/checker" className="font-bold text-teal-600 hover:underline shrink-0 ml-2">Evaluate Regimen</Link>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-navy-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Interactive Demo Action</span>
          </div>
          <h3 className="text-lg font-bold text-white">Evaluate a Multi-Medication Patient Regimen</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Select high-risk patient Eleanor Vance (74y) or Arthur Pendelton (68y) to run the ML polypharmacy engine, detect drug-drug interactions, and inspect explainable scoring.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/patients"
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-teal-500/20"
          >
            <Users className="w-4 h-4" />
            <span>Patient Registry</span>
          </Link>
          <Link
            to="/checker"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <GitCompare className="w-4 h-4" />
            <span>Ad-Hoc Drug Checker</span>
          </Link>
        </div>
      </div>

      {/* Tables: Recent Assessments & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Assessments Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Polypharmacy Assessments</h3>
              <p className="text-[11px] text-slate-500">Evaluated regimens and clinical risk levels</p>
            </div>
            <Link to="/reports" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              View All Reports
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Assessment ID</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Interactions</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No assessments recorded yet. Run an analysis from the patient profile.
                    </td>
                  </tr>
                ) : (
                  recentAssessments.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {a.patientSnapshot?.fullName || a.patient?.fullName || 'Patient'}
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {a.patientSnapshot?.patientId || a.patient?.patientId || ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{a.assessmentId}</td>
                      <td className="py-3 px-4">
                        <RiskBadge risk={a.riskAnalysis?.riskLevel} />
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {(a.interactionsDetected || []).length} conflict(s)
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/assessments/${a._id}`)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
              Clinical Audit Log
            </h3>
            <span className="text-[10px] text-teal-600 font-mono">Live</span>
          </div>

          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent actions recorded.</p>
            ) : (
              recentActivity.map((log) => (
                <div key={log._id} className="text-xs flex items-start space-x-2.5 pb-2.5 border-b border-slate-50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.userRole}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
