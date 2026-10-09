import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Stethoscope, UserCog, Truck, Droplet, Users, X } from 'lucide-react';

export default function DemoRoleSwitcher({ isOpen, onClose }) {
  const { quickLoginAs, user } = useAuth();
  const [switching, setSwitching] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = async (role) => {
    setSwitching(true);
    try {
      await quickLoginAs(role);
      onClose();
    } catch (err) {
      alert('Failed to switch role: ' + err.message);
    } finally {
      setSwitching(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Patient': return <UserCheck className="w-5 h-5 text-teal-400" />;
      case 'Doctor': return <Stethoscope className="w-5 h-5 text-blue-400" />;
      case 'Receptionist': return <Users className="w-5 h-5 text-indigo-400" />;
      case 'Ambulance Driver': return <Truck className="w-5 h-5 text-amber-400" />;
      case 'Blood Bank Admin': return <Droplet className="w-5 h-5 text-rose-400" />;
      case 'Admin': return <UserCog className="w-5 h-5 text-purple-400" />;
      default: return <ShieldCheck className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-outfit">Demo Quick-Role Switcher</h3>
            <p className="text-xs text-slate-400">Instantly switch between any of the 6 system roles for live professor demo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          {DEMO_USERS.map((u) => {
            const isCurrent = user && user.role === u.role;
            return (
              <button
                key={u.role}
                onClick={() => handleRoleSelect(u.role)}
                disabled={switching}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-teal-500/15 border-teal-500/50 text-white ring-1 ring-teal-500/30'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/50">
                  {getRoleIcon(u.role)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                    {u.role}
                    {isCurrent && <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">Active</span>}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{u.name}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Password for all demo accounts: <code className="text-teal-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">password123</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
