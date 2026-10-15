import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DemoRoleSwitcher from './DemoRoleSwitcher';
import { Activity, ShieldAlert, User, LogOut, RefreshCw, PhoneCall } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const getRoleColor = (role) => {
    switch (role) {
      case 'Patient': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Doctor': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Receptionist': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ambulance Driver': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Blood Bank Admin': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Admin': return 'bg-blue-600 text-white border-blue-700 font-semibold';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <>
      <nav className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-sm">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight font-outfit text-slate-800">
                Medi<span className="text-blue-600">Nova</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">
                AI Health
              </span>
            </div>
          </div>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-3">
          {/* Emergency Dispatch Quick Call Banner */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
            <span>Emergency Hotline: <strong className="font-mono">911 / 1-800-MEDINOVA</strong></span>
          </div>

          {/* Switch Role Quick Demo Button */}
          <button
            onClick={() => setShowRoleSwitcher(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-slate-300 transition shadow-sm"
            title="Switch demo role instantly"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Switch Role</span>
          </button>

          {/* Active User Info & Dropdown */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
                <div className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${getRoleColor(user.role)} mt-0.5`}>
                  {user.role}
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
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
