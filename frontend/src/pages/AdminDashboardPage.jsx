import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Server,
  Activity,
  Database,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Clock,
  Cpu
} from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [uRes, sRes, lRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/status'),
        api.get('/admin/audit-logs')
      ]);

      if (uRes.data?.success) setUsers(uRes.data.users || []);
      if (sRes.data?.success) setStatus(sRes.data.system || {});
      if (lRes.data?.success) setAuditLogs(lRes.data.logs || []);
    } catch (err) {
      console.error('[Admin Data Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle`);
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, active: res.data.user.active } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user.');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Querying platform administration telemetry..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-teal-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Administration Console</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          User governance, microservice health, and clinical audit trail surveillance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 ${
            activeTab === 'users' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 ${
            activeTab === 'system' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Services & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 ${
            activeTab === 'audit' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Clinician Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className="px-2 py-1 text-xs rounded border border-slate-200 font-semibold bg-white"
                      >
                        <option value="Doctor">Doctor</option>
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.department || 'General'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        className="text-xs font-semibold text-teal-600 hover:underline"
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: System Telemetry */}
      {activeTab === 'system' && status && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">MongoDB Database</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">{status.services?.database?.status}</p>
              <p className="text-xs text-slate-500">Connected to 127.0.0.1:27017/pharmafog</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Python ML Engine</span>
                <Cpu className="w-5 h-5 text-teal-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">{status.services?.mlEngine?.status}</p>
              <p className="text-xs text-slate-500">Port 8000 • NetworkX + Scikit-learn</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Node.js Runtime</span>
                <Server className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">{status.nodeVersion}</p>
              <p className="text-xs text-slate-500">
                Memory: {status.memoryUsageMB?.heapUsed} MB used of {status.memoryUsageMB?.heapTotal} MB
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Current Database Records</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xl font-bold text-slate-900">{status.dataCounts?.patients}</span>
                <p className="text-xs text-slate-500 mt-0.5">Patients</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xl font-bold text-slate-900">{status.dataCounts?.medications}</span>
                <p className="text-xs text-slate-500 mt-0.5">Medications</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xl font-bold text-slate-900">{status.dataCounts?.interactionRules}</span>
                <p className="text-xs text-slate-500 mt-0.5">Interaction Rules</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xl font-bold text-slate-900">{status.dataCounts?.referenceMedications}</span>
                <p className="text-xs text-slate-500 mt-0.5">Drug Monographs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600">{log.userEmail}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-sm truncate text-slate-600">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
