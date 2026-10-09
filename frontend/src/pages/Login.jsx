import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, Stethoscope, UserCheck, Users, Truck, Droplet, UserCog } from 'lucide-react';

export default function Login({ onNavigateRegister }) {
  const { login, quickLoginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleName) => {
    setError('');
    setLoading(true);
    try {
      await quickLoginAs(roleName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Patient': return <UserCheck className="w-4 h-4 text-teal-400" />;
      case 'Doctor': return <Stethoscope className="w-4 h-4 text-blue-400" />;
      case 'Receptionist': return <Users className="w-4 h-4 text-indigo-400" />;
      case 'Ambulance Driver': return <Truck className="w-4 h-4 text-amber-400" />;
      case 'Blood Bank Admin': return <Droplet className="w-4 h-4 text-rose-400" />;
      case 'Admin': return <UserCog className="w-4 h-4 text-purple-400" />;
      default: return <ShieldCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 z-10 items-stretch">
        
        {/* Left Column: Login Form */}
        <div className="md:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Activity className="w-6 h-6 text-teal-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white font-outfit tracking-tight">
                  Medi<span className="text-teal-400">Nova</span>
                </h1>
                <p className="text-xs text-slate-400">AI Healthcare Management System</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-xs text-slate-400 mb-6">Sign in to access your role-based clinical dashboard.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@medinova.com"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={onNavigateRegister}
                className="text-teal-400 font-semibold hover:underline"
              >
                Register Patient Profile
              </button>
            </p>
          </div>
        </div>

        {/* Right Column: Demo Role Quick Switcher Panel */}
        <div className="md:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Professor Live Demo Mode</span>
            </div>
            <h3 className="text-lg font-bold text-white font-outfit mb-1">Single-Click Role Demo</h3>
            <p className="text-xs text-slate-400 mb-5">
              Select any role below to instantly log in with pre-seeded clinical data without typing credentials.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  onClick={() => handleQuickLogin(u.role)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-500/50 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 group-hover:border-teal-500/30">
                      {getRoleIcon(u.role)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-teal-300 transition">
                        {u.role}
                      </div>
                      <div className="text-[11px] text-slate-400">{u.name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-md font-mono group-hover:bg-teal-500 group-hover:text-white transition">
                    Demo Login &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60 text-[11px] text-slate-400 text-center">
            Standard Demo Password: <code className="text-teal-400 font-mono">password123</code>
          </div>
        </div>

      </div>
    </div>
  );
}
