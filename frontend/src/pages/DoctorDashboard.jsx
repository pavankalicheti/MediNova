import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PriorityBadge from '../components/PriorityBadge';
import { Stethoscope, Calendar, AlertTriangle, FileText, Plus, CheckCircle2, User, Clock } from 'lucide-react';

export default function DoctorDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [triageQueue, setTriageQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAppointments(), api.getTriageQueue()])
      .then(([aptRes, trgRes]) => {
        setAppointments(aptRes.appointments || []);
        setTriageQueue(trgRes.queue || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const criticalCases = triageQueue.filter(t => t.priorityResult && t.priorityResult.priority === 'Critical');

  return (
    <div className="space-y-6">
      {/* Doctor Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-white border border-blue-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Physician Clinical Portal
          </span>
          <h1 className="text-2xl font-bold text-slate-800 font-outfit mt-2">Welcome, {user.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Department: <strong className="text-blue-600">{user.department || user.specialty || 'Cardiovascular Care'}</strong> • ER Priority Queue Monitored
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('triage')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition"
          >
            <AlertTriangle className="w-4 h-4" />
            ER Triage Queue ({triageQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            New Clinical Diagnosis
          </button>
        </div>
      </div>

      {/* Critical Alert Warning if Critical Cases exist */}
      {criticalCases.length > 0 && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between gap-4 critical-pulse shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <strong className="block text-sm font-bold text-blue-900 font-outfit">IMMEDIATE ATTENTION REQUIRED: {criticalCases.length} Critical ER Case(s)</strong>
              <span>Highest priority triage patient: <strong className="text-blue-900">{criticalCases[0].patientName}</strong> ({criticalCases[0].symptoms})</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('triage')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shrink-0"
          >
            Open ER Trauma Queue &rarr;
          </button>
        </div>
      )}

      {/* Main Grid: Today's Appointments & Emergency Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doctor Calendar Schedule */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 font-outfit flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Consultation Schedule
            </h2>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              Manage Calendar &rarr;
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No consultations assigned for today.</div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800 font-outfit">{apt.patientName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{apt.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-blue-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      {apt.timeSlot}
                    </div>
                    <span className="text-[10px] bg-slate-100 text-blue-600 border border-slate-200 px-2 py-0.5 rounded font-mono">
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Emergency Priority Queue Preview */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 font-outfit flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              Live Emergency Triage Queue
            </h2>
            <button
              onClick={() => setActiveTab('triage')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              Full Queue ({triageQueue.length}) &rarr;
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading emergency queue...</div>
          ) : triageQueue.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No pending emergency triage cases.</div>
          ) : (
            <div className="space-y-3">
              {triageQueue.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 font-outfit">{item.patientName} ({item.age}y)</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{item.symptoms}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">SpO2: {item.spo2}% | HR: {item.heartRate} bpm</div>
                  </div>
                  <PriorityBadge priority={item.priorityResult ? item.priorityResult.priority : 'Low'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
