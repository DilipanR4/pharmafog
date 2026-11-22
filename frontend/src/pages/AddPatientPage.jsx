import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createPatient } from '../services/patientService';

export const AddPatientPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    sex: 'Undisclosed',
    weight: '',
    allergies: '',
    conditions: '',
    clinicalNotes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || formData.age === '') {
      setError('Please provide patient full name and age.');
      return;
    }

    try {
      setLoading(true);
      const res = await createPatient({
        fullName: formData.fullName.trim(),
        age: Number(formData.age),
        sex: formData.sex,
        weight: formData.weight ? Number(formData.weight) : null,
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        conditions: formData.conditions ? formData.conditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        clinicalNotes: formData.clinicalNotes.trim()
      });

      if (res.data && res.data.success) {
        navigate(`/patients/${res.data.patient._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering patient record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          to="/patients"
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Register New Patient</h1>
          <p className="text-xs text-slate-500">Record baseline demographics, allergies, and clinical diagnosis</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Patient Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Thomas Wayne"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Age (years) *</label>
              <input
                type="number"
                name="age"
                required
                min={0}
                max={130}
                placeholder="e.g. 72"
                value={formData.age}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Biological Sex</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Undisclosed">Undisclosed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Weight (kg) (Optional)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                placeholder="e.g. 68.5"
                value={formData.weight}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Known Allergies (Comma-separated)</label>
              <input
                type="text"
                name="allergies"
                placeholder="e.g. Penicillin, Aspirin, Sulfa"
                value={formData.allergies}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Existing Clinical Conditions (Comma-separated)</label>
            <input
              type="text"
              name="conditions"
              placeholder="e.g. Atrial Fibrillation, Hypertension, Osteoarthritis, Type 2 Diabetes"
              value={formData.conditions}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Clinical Background Notes</label>
            <textarea
              name="clinicalNotes"
              rows={3}
              placeholder="Relevant surgical history, adherence considerations, recent symptoms or reason for polypharmacy review..."
              value={formData.clinicalNotes}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Link
              to="/patients"
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Record...' : 'Save & Add Medications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
