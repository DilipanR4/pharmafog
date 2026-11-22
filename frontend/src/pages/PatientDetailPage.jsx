import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Pill,
  Plus,
  Play,
  FileText,
  AlertTriangle,
  Sparkles,
  Download,
  Trash2,
  Edit2,
  Calendar,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { getPatientById } from '../services/patientService';
import { addMedication, deleteMedication, updateMedication, searchReferenceMedications } from '../services/medicationService';
import { runAssessment } from '../services/assessmentService';
import { exportAssessmentPDF } from '../services/pdfExport';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

export const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Add Medication Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [referenceSuggestions, setReferenceSuggestions] = useState([]);
  const [newMed, setNewMed] = useState({
    genericName: '',
    brandName: '',
    activeIngredient: '',
    drugClass: '',
    dosage: '',
    frequency: 'Once daily',
    route: 'Oral',
    duration: 'Ongoing',
    notes: ''
  });

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await getPatientById(id);
      if (res.data && res.data.success) {
        setPatient(res.data.patient);
        setMedications(res.data.medications || []);
        setLatestAssessment(res.data.latestAssessment);
      }
    } catch (err) {
      console.error('[Patient Detail Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  // Autocomplete drug reference search
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchReferenceMedications(searchQuery)
        .then((res) => {
          if (res.data?.success) setReferenceSuggestions(res.data.medications || []);
        })
        .catch(() => {});
    } else {
      setReferenceSuggestions([]);
    }
  }, [searchQuery]);

  const selectSuggestion = (ref) => {
    setNewMed({
      ...newMed,
      genericName: ref.genericName,
      brandName: ref.brandNames && ref.brandNames.length ? ref.brandNames[0] : '',
      activeIngredient: ref.activeIngredient,
      drugClass: ref.drugClass,
      dosage: ref.typicalDosage ? ref.typicalDosage.split(' ')[0] : '10mg',
      route: ref.route || 'Oral'
    });
    setSearchQuery('');
    setReferenceSuggestions([]);
  };

  const handleAddMedicationSubmit = async (e) => {
    e.preventDefault();
    if (!newMed.genericName || !newMed.dosage || !newMed.frequency) {
      alert('Generic name, dosage, and frequency are required.');
      return;
    }

    try {
      await addMedication(patient._id, newMed);
      setIsAddModalOpen(false);
      setNewMed({
        genericName: '',
        brandName: '',
        activeIngredient: '',
        drugClass: '',
        dosage: '',
        frequency: 'Once daily',
        route: 'Oral',
        duration: 'Ongoing',
        notes: ''
      });
      fetchPatientData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding medication.');
    }
  };

  const handleDeleteMed = async (medId) => {
    if (!window.confirm('Remove this medication from patient list?')) return;
    try {
      await deleteMedication(medId);
      fetchPatientData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting medication.');
    }
  };

  const handleToggleStatus = async (med) => {
    try {
      const newStatus = med.status === 'Active' ? 'Discontinued' : 'Active';
      await updateMedication(med._id, { status: newStatus });
      fetchPatientData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status.');
    }
  };

  const handleRunAnalysis = async () => {
    const activeMeds = medications.filter((m) => m.status === 'Active');
    if (activeMeds.length === 0) {
      alert('Patient must have at least one active medication to run polypharmacy evaluation.');
      return;
    }

    try {
      setAnalyzing(true);
      const res = await runAssessment(patient._id);
      if (res.data && res.data.success) {
        navigate(`/assessments/${res.data.assessment._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Analysis execution error.');
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving patient clinical record..." size="lg" />;
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Patient record not found.</p>
        <Link to="/patients" className="text-teal-600 font-semibold mt-2 inline-block">
          Return to Registry
        </Link>
      </div>
    );
  }

  const activeMeds = medications.filter((m) => m.status === 'Active');
  const discontinuedMeds = medications.filter((m) => m.status === 'Discontinued');

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/patients"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">{patient.fullName}</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-teal-700 font-bold border border-slate-200">
                {patient.patientId}
              </span>
              <RiskBadge risk={patient.riskStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned Clinician: {patient.assignedDoctor?.name || 'Dr. Alexander Thorne'} •{' '}
              {patient.assignedDoctor?.department || 'Cardiology'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5 text-teal-600" />
            <span>Add Medication</span>
          </button>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing || activeMeds.length === 0}
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 mr-1.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Analyzing Regimen...' : 'Analyze Regimen'}</span>
          </button>
        </div>
      </div>

      {/* Patient Clinical Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demographics</span>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              {patient.age} years old • {patient.sex}
            </p>
            <p className="text-[11px] text-slate-500">Weight: {patient.weight ? `${patient.weight} kg` : 'Not recorded'}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Known Allergies</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200">
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No documented drug allergies</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Conditions</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patient.conditions && patient.conditions.length > 0 ? (
                patient.conditions.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-700">
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">None specified</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Polypharmacy Burden</span>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {activeMeds.length} Active Prescriptions
            </p>
            <p className="text-[11px] text-slate-500">
              {activeMeds.length >= 10
                ? 'Severe Hyperpolypharmacy'
                : activeMeds.length >= 5
                ? 'WHO Polypharmacy Threshold'
                : 'Standard Regimen'}
            </p>
          </div>
        </div>

        {patient.clinicalNotes && (
          <div className="pt-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Clinical Notes: </span>
            {patient.clinicalNotes}
          </div>
        )}
      </div>

      {/* Active Medications List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Active Prescribed Medications ({activeMeds.length})
            </h3>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medication</span>
          </button>
        </div>

        {activeMeds.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No active medications in regimen. Click "Add Medication" above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Medication & Brand</th>
                  <th className="py-3 px-4">Active Ingredient</th>
                  <th className="py-3 px-4">Dosage & Frequency</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Drug Class</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeMeds.map((med) => (
                  <tr key={med._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{med.genericName}</div>
                      {med.brandName && (
                        <span className="text-[10px] text-slate-400 font-medium">({med.brandName})</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {med.activeIngredient || med.genericName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{med.dosage}</div>
                      <div className="text-[10px] text-slate-400">{med.frequency}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{med.route || 'Oral'}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{med.drugClass || 'General'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={med.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleToggleStatus(med)}
                        className="px-2 py-1 text-[10px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                        title="Mark Discontinued"
                      >
                        Discontinue
                      </button>
                      <button
                        onClick={() => handleDeleteMed(med._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Discontinued Medications (if any) */}
      {discontinuedMeds.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden opacity-80">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Discontinued Medications ({discontinuedMeds.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <tbody className="divide-y divide-slate-100">
                {discontinuedMeds.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium line-through">{m.genericName}</td>
                    <td className="py-2.5 px-4">{m.dosage}</td>
                    <td className="py-2.5 px-4">{m.frequency}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(m)}
                        className="text-teal-600 text-xs font-semibold hover:underline"
                      >
                        Reactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Latest Assessment Summary Banner */}
      {latestAssessment && (
        <div className="bg-gradient-to-r from-slate-900 to-navy-950 rounded-xl p-5 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Latest Polypharmacy Evaluation</span>
              <span className="text-[10px] text-slate-400 font-mono">({latestAssessment.assessmentId})</span>
            </div>
            <p className="text-xs text-slate-300">
              Risk: <strong className="text-white">{latestAssessment.riskAnalysis?.riskLevel}</strong> (Score:{' '}
              {latestAssessment.riskAnalysis?.score}/100) • Found{' '}
              {(latestAssessment.interactionsDetected || []).length} drug interactions and{' '}
              {(latestAssessment.duplicatesDetected || []).length} duplicate warnings.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => exportAssessmentPDF(latestAssessment)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <Link
              to={`/assessments/${latestAssessment._id}`}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
            >
              View Full Report
            </Link>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Medication to ${patient.fullName}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddMedicationSubmit} className="space-y-4">
          {/* Autocomplete Drug Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Search Clinical Drug Reference
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Type drug name (e.g. Warfarin, Lisinopril, Metformin)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            {referenceSuggestions.length > 0 && (
              <div className="mt-1 max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white shadow-lg divide-y divide-slate-100 z-50">
                {referenceSuggestions.map((ref) => (
                  <div
                    key={ref.referenceId}
                    onClick={() => selectSuggestion(ref)}
                    className="p-2.5 hover:bg-teal-50 cursor-pointer text-xs transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{ref.genericName}</span>
                      {ref.brandNames && ref.brandNames.length > 0 && (
                        <span className="text-slate-500 text-[11px] ml-1.5">({ref.brandNames.join(', ')})</span>
                      )}
                      <p className="text-[10px] text-teal-600">{ref.drugClass}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Generic Drug Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Warfarin"
                value={newMed.genericName}
                onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Coumadin"
                value={newMed.brandName}
                onChange={(e) => setNewMed({ ...newMed, brandName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Active Ingredient</label>
              <input
                type="text"
                placeholder="e.g. Warfarin Sodium"
                value={newMed.activeIngredient}
                onChange={(e) => setNewMed({ ...newMed, activeIngredient: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Drug Class</label>
              <input
                type="text"
                placeholder="e.g. Anticoagulant"
                value={newMed.drugClass}
                onChange={(e) => setNewMed({ ...newMed, drugClass: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Dosage *</label>
              <input
                type="text"
                required
                placeholder="e.g. 5mg, 500mg, 20mEq"
                value={newMed.dosage}
                onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Frequency *</label>
              <input
                type="text"
                required
                placeholder="e.g. Once daily, Twice daily"
                value={newMed.frequency}
                onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Route</label>
              <select
                value={newMed.route}
                onChange={(e) => setNewMed({ ...newMed, route: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
              >
                <option value="Oral">Oral</option>
                <option value="Intravenous">Intravenous</option>
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Inhalation">Inhalation</option>
                <option value="Topical">Topical</option>
                <option value="Sublingual">Sublingual</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Duration</label>
              <input
                type="text"
                placeholder="e.g. 30 days, Ongoing"
                value={newMed.duration}
                onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
            >
              Save Medication
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
