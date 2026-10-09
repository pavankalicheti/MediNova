import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DemoRoleSwitcher from './DemoRoleSwitcher';
import { Activity, ShieldAlert, User, LogOut, RefreshCw, PhoneCall } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const getRoleColor = (role) => {
    switch (role) {
      case 'Patient': return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'Doctor': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Receptionist': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Ambulance Driver': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Blood Bank Admin': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <>
      <nav className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-teal-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight font-outfit text-white">
                Medi<span className="text-teal-400">Nova</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded">
                AI Health
              </span>
            </div>
          </div>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-3">
          {/* Emergency Dispatch Quick Call Banner */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            <span>Emergency Hotline: <strong className="font-mono">911 / 1-800-MEDINOVA</strong></span>
          </div>

          {/* Switch Role Quick Demo Button */}
          <button
            onClick={() => setShowRoleSwitcher(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 hover:border-slate-600 transition shadow-sm"
            title="Switch demo role instantly"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Switch Role</span>
          </button>

          {/* Active User Info & Dropdown */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                <div className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${getRoleColor(user.role)} mt-0.5`}>
                  {user.role}
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold text-sm">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Role Switcher Modal */}
      <DemoRoleSwitcher isOpen={showRoleSwitcher} onClose={() => setShowRoleSwitcher(false)} />
    </>
  );
}
