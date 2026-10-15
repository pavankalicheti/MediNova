import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Stethoscope, UserCog, Truck, Droplet, Users, Pill, X } from 'lucide-react';

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
      case 'Patient': return <UserCheck className="w-5 h-5 text-blue-600" />;
      case 'Doctor': return <Stethoscope className="w-5 h-5 text-sky-600" />;
      case 'Receptionist': return <Users className="w-5 h-5 text-blue-500" />;
      case 'Ambulance Driver': return <Truck className="w-5 h-5 text-sky-500" />;
      case 'Blood Bank Admin': return <Droplet className="w-5 h-5 text-blue-600" />;
      case 'Pharmacist': return <Pill className="w-5 h-5 text-blue-600" />;
      case 'Admin': return <UserCog className="w-5 h-5 text-blue-700" />;
      default: return <ShieldCheck className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 font-outfit">Demo Quick-Role Switcher</h3>
            <p className="text-xs text-slate-500">Instantly switch between any of the 6 system roles for live professor demo</p>
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
                    ? 'bg-blue-50 border-blue-300 text-slate-800 ring-1 ring-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  {getRoleIcon(u.role)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                    {u.role}
                    {isCurrent && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Active</span>}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{u.name}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Password for all demo accounts: <code className="text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded">password123</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
