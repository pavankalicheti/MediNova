import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, AlertTriangle, Truck, Plus, Search, Clock, CheckCircle2 } from 'lucide-react';

export default function ReceptionistDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAppointments(), api.getAllPatients()])
      .then(([aptRes, patRes]) => {
        setAppointments(aptRes.appointments || []);
        setPatients(patRes.patients || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Hospital Reception & Patient Intake
          </span>
          <h1 className="text-2xl font-bold text-white font-outfit mt-2">Welcome, {user.name}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Master Calendar • Patient Walk-in Intake • Emergency Ambulance Dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('triage')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-red-500/20 flex items-center gap-1.5 transition"
          >
            <AlertTriangle className="w-4 h-4" />
            Walk-in AI Triage Intake
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
          >
            <Calendar className="w-4 h-4" />
            Master Appointments Calendar
          </button>
        </div>
      </div>

      {/* Reception Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Total Registered Patients</div>
          <div className="text-2xl font-extrabold text-white font-outfit mt-1">{patients.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Scheduled Consultations</div>
          <div className="text-2xl font-extrabold text-indigo-400 font-outfit mt-1">{appointments.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">Pending Bookings</div>
          <div className="text-2xl font-extrabold text-teal-400 font-outfit mt-1">
            {appointments.filter(a => a.status === 'Booked').length}
          </div>
        </div>
      </div>

      {/* Main Grid: Master Calendar View & Patient Intake Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Master Appointments Roster
            </h2>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Full Screen View &rarr;
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading master schedule...</div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-outfit">{apt.patientName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Doctor: {apt.doctorName} ({apt.department})</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-teal-400">{apt.date} • {apt.timeSlot}</div>
                    <span className="text-[10px] bg-slate-950 text-indigo-300 border border-slate-800 px-2 py-0.5 rounded font-bold">
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            Patient Directory
          </h2>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {patients.map((pat) => (
              <div key={pat.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="text-xs font-bold text-white font-outfit">{pat.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Blood: <strong className="text-teal-400">{pat.bloodGroup}</strong> | Age: {pat.age} | {pat.contact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
