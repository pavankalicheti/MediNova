import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, AlertTriangle, Truck, Droplet, Clock, ArrowRight, Heart, Activity } from 'lucide-react';

export default function PatientDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAppointments(), api.getRecords()])
      .then(([aptRes, recRes]) => {
        setAppointments(aptRes.appointments || []);
        setRecords(recRes.records || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900/40 via-slate-900 to-slate-900 border border-teal-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
            Patient Portal Dashboard
          </span>
          <h1 className="text-2xl font-bold text-white font-outfit mt-2">Welcome back, {user.name}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Blood Group: <strong className="text-teal-400 font-mono">{user.bloodGroup || 'O+'}</strong> • Age: {user.age || 34} • Emergency Hotline Active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('triage')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-red-500/20 flex items-center gap-1.5 transition"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            AI Emergency Triage
          </button>
          <button
            onClick={() => setActiveTab('ambulance')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition"
          >
            <Truck className="w-4 h-4" />
            Request Ambulance
          </button>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('appointments')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition text-left group"
        >
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 w-fit mb-3 group-hover:scale-105 transition">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-outfit group-hover:text-teal-300 transition">Book Appointments</h3>
          <p className="text-xs text-slate-400 mt-1">View available specialists and select consultation slots.</p>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition text-left group"
        >
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit mb-3 group-hover:scale-105 transition">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-outfit group-hover:text-blue-300 transition">Medical Records</h3>
          <p className="text-xs text-slate-400 mt-1">Access past diagnoses, doctor notes, and prescriptions.</p>
        </button>

        <button
          onClick={() => setActiveTab('bloodbank')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition text-left group"
        >
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit mb-3 group-hover:scale-105 transition">
            <Droplet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-outfit group-hover:text-rose-300 transition">Blood Bank Match</h3>
          <p className="text-xs text-slate-400 mt-1">Find compatible blood donors or register as a donor.</p>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition text-left group"
        >
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit mb-3 group-hover:scale-105 transition">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-outfit group-hover:text-purple-300 transition">Patient Passport</h3>
          <p className="text-xs text-slate-400 mt-1">Update medical history summary and emergency contact.</p>
        </button>
      </div>

      {/* Main Section: Recent Appointments & Medical History Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appointments Summary */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" />
              Upcoming Appointments
            </h2>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-semibold"
            >
              View All &rarr;
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading schedule...</div>
          ) : appointments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No scheduled appointments.</div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-outfit">{apt.doctorName} ({apt.department})</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{apt.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-teal-400">{apt.date} • {apt.timeSlot}</div>
                    <span className="text-[9px] bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-full font-bold">
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medical Record Overview */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Recent Diagnostic History
            </h2>
            <button
              onClick={() => setActiveTab('records')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              View All &rarr;
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading records...</div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No medical records declared yet.</div>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white font-outfit">{rec.diagnosis}</span>
                    <span className="text-[10px] font-mono text-slate-400">{rec.date}</span>
                  </div>
                  <div className="text-xs text-slate-300">Prescription: {Array.isArray(rec.prescriptions) && rec.prescriptions[0] ? rec.prescriptions[0].name : 'Follow doctor notes'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
