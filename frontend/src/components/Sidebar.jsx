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
  Sparkles,
  Activity,
  Share2,
  Cpu,
  Lock,
  Navigation,
  ScanLine,
  Mic,
  Languages,
  Bed,
  ShieldCheck,
  Brain,
  Layers,
  Radio
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  // Active Modules Configuration
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Patient', 'Doctor', 'Receptionist', 'Ambulance Driver', 'Blood Bank Admin', 'Pharmacist', 'Admin'] },
    { id: 'telemedicine', label: 'Telemedicine & Video', icon: Video, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: 'Live Room' },
    { id: 'pharmacy', label: 'Pharmacy & Store', icon: Pill, roles: ['Patient', 'Doctor', 'Receptionist', 'Pharmacist', 'Admin'], badge: 'Store & Rx' },
    { id: 'analytics', label: 'Predictive Analytics', icon: BarChart3, roles: ['Doctor', 'Receptionist', 'Blood Bank Admin', 'Pharmacist', 'Admin'], badge: 'AI Engine' },
    { id: 'iot_vitals', label: 'IoT Vitals Monitor', icon: Activity, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: 'Live BLE' },
    { id: 'emr_exchange', label: 'Cross-Hospital EMR', icon: Share2, roles: ['Doctor', 'Receptionist', 'Blood Bank Admin', 'Pharmacist', 'Admin'], badge: 'FHIR v4' },
    { id: 'genomics', label: 'Genomic Profiling', icon: Cpu, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: 'DNA Risk' },
    { id: 'robotic_surgery', label: 'Robotic Surgery', icon: Sparkles, roles: ['Doctor', 'Receptionist', 'Admin'], badge: '5G Tele-OR' },
    { id: 'quantum_telemetry', label: 'Quantum Telemetry', icon: Lock, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: 'QKD NIST' },
    { id: 'drone_dispatch', label: 'Drone Blood Dispatch', icon: Navigation, roles: ['Doctor', 'Receptionist', 'Blood Bank Admin', 'Pharmacist', 'Admin'], badge: 'BVLOS eVTOL' },
    { id: 'imaging_ai', label: 'AI Medical Imaging', icon: ScanLine, roles: ['Doctor', 'Receptionist', 'Admin'], badge: 'DenseNet-121' },
    { id: 'voice_assistant', label: 'Voice Healthcare AI', icon: Mic, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: 'WebSpeech' },
    { id: 'multilingual', label: 'Multilingual Care', icon: Languages, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: '5 Languages' },
    { id: 'bed_management', label: 'Hospital Beds & ICU', icon: Bed, roles: ['Doctor', 'Receptionist', 'Ambulance Driver', 'Blood Bank Admin', 'Pharmacist', 'Admin'], badge: 'Live Wards' },
    { id: 'insurance', label: 'Insurance & Claims', icon: ShieldCheck, roles: ['Patient', 'Doctor', 'Receptionist', 'Pharmacist', 'Admin'], badge: 'EDI 270/271' },
    { id: 'advanced_biotech', label: 'Neural BCI & Biotech', icon: Brain, roles: ['Doctor', 'Receptionist', 'Admin'], badge: '64-Ch & Nano' },
    { id: 'bioprinting', label: '3D Bio-Printing', icon: Layers, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: 'BioMatrix' },
    { id: 'space_telemetry', label: 'Deep-Space Telemetry', icon: Radio, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: 'DTN Orbit' },
    { id: 'triage', label: 'AI Emergency Triage', icon: AlertTriangle, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'], badge: 'AI Powered' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'] },
    { id: 'records', label: 'Medical Records', icon: FileText, roles: ['Patient', 'Doctor', 'Receptionist', 'Admin'] },
    { id: 'ambulance', label: 'Ambulance Dispatch', icon: Truck, roles: ['Patient', 'Doctor', 'Receptionist', 'Ambulance Driver', 'Admin'] },
    { id: 'bloodbank', label: 'Blood Bank & Donors', icon: Droplet, roles: ['Patient', 'Doctor', 'Receptionist', 'Blood Bank Admin', 'Admin'] },
    { id: 'profile', label: 'My Patient Profile', icon: User, roles: ['Patient'] },
    { id: 'admin', label: 'System Admin', icon: Shield, roles: ['Admin'] },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] p-4 shadow-sm">
      <div className="space-y-6">
        {/* Active Modules Header */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Modules ({role})</span>
            <span className="text-blue-600 font-mono">Online</span>
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
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role Footer Info Card */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
          <span>MediNova Platform</span>
          <span className="text-blue-600">v1.0 Demo</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          Role-Based Access Control active.
        </div>
      </div>
    </aside>
  );
}
