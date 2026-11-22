import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HeartPulse, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, UserCheck, Shield, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20 font-bold">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div className="text-left">
            <span className="text-xl font-extrabold tracking-wider text-white">PHARMAFOG</span>
            <span className="block text-[10px] text-teal-400 font-medium tracking-wide">MEDICATION SAFETY PLATFORM</span>
          </div>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Clinician Portal Sign In</h2>
        <p className="text-xs text-slate-400 mt-1">Access clinical polypharmacy decision support tools</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {/* Demo Accounts Banner */}
          <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                Quick Demo Credentials
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Auto Fill</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => fillDemo('doctor@pharmafog.health', 'Doctor@123')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors group"
              >
                <div className="flex items-center text-teal-300 font-bold text-[11px]">
                  <Stethoscope className="w-3 h-3 mr-1" />
                  Doctor
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">Dr. Thorne</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('pharmacist@pharmafog.health', 'Pharmacist@123')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors group"
              >
                <div className="flex items-center text-amber-300 font-bold text-[11px]">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Pharmacist
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">Sarah Lin</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('admin@pharmafog.health', 'Admin@123')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors group"
              >
                <div className="flex items-center text-purple-300 font-bold text-[11px]">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">SysAdmin</div>
              </button>
            </div>
          </div>

          {isExpired && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Session expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Work Email</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@pharmafog.health"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-teal-500 hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Clinical Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            <span>New clinical user? </span>
            <Link to="/register" className="font-semibold text-teal-400 hover:text-teal-300">
              Register here
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-400">
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};
