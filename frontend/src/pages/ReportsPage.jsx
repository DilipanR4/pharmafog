import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Download, Search, Eye, Filter, Calendar } from 'lucide-react';
import { getDashboardStats } from '../services/assessmentService';
import { exportAssessmentPDF } from '../services/pdfExport';
import { RiskBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ReportsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res.data?.success) {
          setAssessments(res.data.recentAssessments || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assessments.filter((a) => {
    const pName = (a.patientSnapshot?.fullName || a.patient?.fullName || '').toLowerCase();
    const asmId = (a.assessmentId || '').toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = pName.includes(query) || asmId.includes(query);

    const risk = a.riskAnalysis?.riskLevel || '';
    const matchesRisk = riskFilter === 'All' || risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Assessment Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Audit-ready repository of evaluated polypharmacy regimens and PDF clinical reports
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name or assessment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Risk Filter:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
          >
            <option value="All">All Risk Levels</option>
            <option value="High Risk">High Risk</option>
            <option value="Moderate Risk">Moderate Risk</option>
            <option value="Low Risk">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading assessment reports catalog..." />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No matching reports found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Assessment ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Interactions & Dups</th>
                  <th className="py-3 px-4">Assessment Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{a.assessmentId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {a.patientSnapshot?.fullName || a.patient?.fullName || 'Patient'}
                      </div>
                      <div className="text-[10px] text-teal-600 font-mono">
                        {a.patientSnapshot?.patientId || a.patient?.patientId || ''}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge risk={a.riskAnalysis?.riskLevel} />
                    </td>
                    <td className="py-3 px-4">
                      {(a.interactionsDetected || []).length} Interactions •{' '}
                      {(a.duplicatesDetected || []).length} Duplications
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => navigate(`/assessments/${a._id}`)}
                        className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                        title="View Full Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => exportAssessmentPDF(a)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
