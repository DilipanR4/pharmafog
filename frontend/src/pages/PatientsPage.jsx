import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Trash2,
  Eye,
  Activity,
  AlertTriangle,
  Pill,
  ArrowRight
} from 'lucide-react';
import { getPatients, deletePatient } from '../services/patientService';
import { RiskBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

export const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskStatus, setRiskStatus] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await getPatients({ search, riskStatus });
      if (res.data && res.data.success) {
        setPatients(res.data.patients || []);
      }
    } catch (err) {
      console.error('[Fetch Patients Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, riskStatus]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deletePatient(deleteId);
      setDeleteId(null);
      setPatientToDelete(null);
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting patient record.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Manage patient medical records, active regimens, and polypharmacy risk profiles</p>
        </div>
        <Link
          to="/patients/new"
          className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          <span>Register New Patient</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID (e.g. PF-1001), condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Risk Filter:</span>
          <select
            value={riskStatus}
            onChange={(e) => setRiskStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
          >
            <option value="All">All Risk Levels</option>
            <option value="High Risk">High Risk</option>
            <option value="Moderate Risk">Moderate Risk</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Not Evaluated">Not Evaluated</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading registered patients..." />
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No matching patient records found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Try clearing your search query or register a new patient.</p>
            <Link
              to="/patients/new"
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white"
            >
              Register Patient
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient Info</th>
                  <th className="py-3 px-4">Age / Sex / Wt</th>
                  <th className="py-3 px-4">Clinical Conditions</th>
                  <th className="py-3 px-4">Active Meds</th>
                  <th className="py-3 px-4">Polypharmacy Risk</th>
                  <th className="py-3 px-4">Last Evaluation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.fullName}</div>
                      <div className="font-mono text-[10px] text-teal-600 font-semibold">{p.patientId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{p.age} yrs • {p.sex}</div>
                      <div className="text-[10px] text-slate-400">{p.weight ? `${p.weight} kg` : 'Weight unrecorded'}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {p.conditions && p.conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.conditions.slice(0, 2).map((c, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                              {c}
                            </span>
                          ))}
                          {p.conditions.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-semibold">+{p.conditions.length - 2} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None noted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
                        <Pill className="w-3 h-3 mr-1 text-teal-600" />
                        {p.activeMedicationsCount || 0} active
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge risk={p.riskStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.lastEvaluatedAt ? new Date(p.lastEvaluatedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => navigate(`/patients/${p._id}`)}
                        className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                        title="View Profile & Regimen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(p._id);
                          setPatientToDelete(p);
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Delete Patient Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => {
          setDeleteId(null);
          setPatientToDelete(null);
        }}
        title="Confirm Record Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Permanent deletion warning</p>
              <p className="mt-0.5">
                Are you sure you want to delete patient <strong>{patientToDelete?.fullName}</strong> ({patientToDelete?.patientId})? This will also remove all associated prescriptions and evaluation history.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setDeleteId(null);
                setPatientToDelete(null);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
