import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  FileText,
  Calendar,
  AlertTriangle,
  Truck,
  Droplet,
  Shield,
  Video,
  Pill,
  BarChart3,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  // Active Modules Configuration
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Patient', 'Doctor', 'Receptionist', 'Ambulance Driver', 'Blood Bank Admin', 'Admin'] },
    { id: 'triage', label: 'AI Emergency Triage', icon: AlertTriangle, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: 'AI Powered' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'] },
    { id: 'records', label: 'Medical Records', icon: FileText, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'] },
    { id: 'ambulance', label: 'Ambulance Dispatch', icon: Truck, roles: ['Patient', 'Doctor', 'Receptionist', 'Ambulance Driver', 'Admin'] },
    { id: 'bloodbank', label: 'Blood Bank & Donors', icon: Droplet, roles: ['Patient', 'Doctor', 'Receptionist', 'Blood Bank Admin', 'Admin'] },
    { id: 'profile', label: 'My Patient Profile', icon: User, roles: ['Patient'] },
    { id: 'admin', label: 'System Admin', icon: Shield, roles: ['Admin'] },
  ];

  // Future Roadmap Modules (Not implemented, display only)
  const futureModules = [
    { label: 'Telemedicine Consultation', icon: Video },
    { label: 'Pharmacy & Medicine Store', icon: Pill },
    { label: 'Predictive Analytics Engine', icon: BarChart3 },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        {/* Active Modules Header */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Modules ({role})</span>
            <span className="text-teal-400 font-mono">Phase A & B</span>
          </div>

          <nav className="space-y-1">
            {allowedItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-teal-300 border border-teal-500/30 font-semibold shadow-md shadow-teal-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded font-bold">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Future Modules Roadmap (Placeholders) */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Future Roadmap</span>
          </div>

          <div className="space-y-1">
            {futureModules.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-400/80 bg-slate-800/30 border border-dashed border-slate-800 opacity-70 cursor-not-allowed"
                  title="Placeholder Nav Item for Future Module"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded uppercase font-semibold">
                    Soon
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Footer Info Card */}
      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
          <span>MediNova Platform</span>
          <span className="text-teal-400">v1.0 Demo</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          Role-Based Access Control active.
        </div>
      </div>
    </aside>
  );
}
