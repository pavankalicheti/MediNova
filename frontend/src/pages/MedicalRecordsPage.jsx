import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Stethoscope, User, Calendar, Pill, Activity, FlaskConical, CheckCircle2 } from 'lucide-react';

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [recordForm, setRecordForm] = useState({
    patientId: '',
    diagnosis: '',
    symptoms: '',
    prescriptions: '',
    labResults: '',
    doctorNotes: ''
  });

  const fetchData = async () => {
    try {
      const recRes = await api.getRecords();
      setRecords(recRes.records || []);
      if (user.role === 'Doctor' || user.role === 'Admin') {
        const patRes = await api.getAllPatients();
        setPatients(patRes.patients || []);
        if (patRes.patients && patRes.patients.length > 0) {
          setRecordForm(prev => ({ ...prev, patientId: patRes.patients[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createRecord(recordForm);
      setShowAddModal(false);
      setRecordForm({
        patientId: patients[0] ? patients[0].id : '',
        diagnosis: '',
        symptoms: '',
        prescriptions: '',
        labResults: '',
        doctorNotes: ''
      });
      fetchData();
    } catch (err) {
      alert('Error creating medical record: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Digital Medical History Timeline</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-outfit">Digital Medical Records</h1>
          <p className="text-xs text-slate-400 mt-1">
            {user.role === 'Patient'
              ? 'Securely access your complete diagnostic history, prescriptions, and physician notes.'
              : 'Review patient health histories and issue formal medical diagnoses and digital prescriptions.'}
          </p>
        </div>

        {(user.role === 'Doctor' || user.role === 'Admin') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Add Patient Record Entry
          </button>
        )}
      </div>

      {/* Doctor Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white font-outfit mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-400" />
              New Clinical Record Entry
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Patient</label>
                <select
                  value={recordForm.patientId}
                  onChange={(e) => setRecordForm({ ...recordForm, patientId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.name} (Age: {pat.age}, Blood: {pat.bloodGroup})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Diagnosis</label>
                <input
                  type="text"
                  required
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Bronchitis / Mild Sinus Tachycardia"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observed Symptoms</label>
                <input
                  type="text"
                  value={recordForm.symptoms}
                  onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                  placeholder="e.g. Persistent dry cough, mild nocturnal fever"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prescribed Medication & Dosage</label>
                <input
                  type="text"
                  value={recordForm.prescriptions}
                  onChange={(e) => setRecordForm({ ...recordForm, prescriptions: e.target.value })}
                  placeholder="e.g. Amoxicillin 500mg (3x daily for 7 days)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lab Findings / Diagnostics</label>
                <input
                  type="text"
                  value={recordForm.labResults}
                  onChange={(e) => setRecordForm({ ...recordForm, labResults: e.target.value })}
                  placeholder="e.g. Chest X-Ray clear, CBC normal"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Doctor Remarks & Instructions</label>
                <textarea
                  rows="2"
                  value={recordForm.doctorNotes}
                  onChange={(e) => setRecordForm({ ...recordForm, doctorNotes: e.target.value })}
                  placeholder="Follow-up advice, dietary instructions..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20"
                >
                  Save Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white font-outfit flex items-center justify-between">
          <span>Medical History Records ({records.length})</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading medical records...</div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No medical records found.</div>
        ) : (
          <div className="space-y-4">
            {records.map((rec) => (
              <div key={rec.id} className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <div>
                    <div className="text-base font-bold text-white font-outfit">{rec.diagnosis}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-teal-400 font-medium">
                        <User className="w-3.5 h-3.5" />
                        Patient: {rec.patientName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-blue-400 font-medium">
                        <Stethoscope className="w-3.5 h-3.5" />
                        Doctor: {rec.doctorName}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                    📅 {rec.date}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                    <div className="text-[11px] font-semibold text-rose-400 mb-1 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" /> Symptoms
                    </div>
                    <div className="text-xs text-slate-300">{rec.symptoms}</div>
                  </div>

                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                    <div className="text-[11px] font-semibold text-teal-400 mb-1 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5" /> Prescriptions
                    </div>
                    {Array.isArray(rec.prescriptions) && rec.prescriptions.length > 0 ? (
                      <ul className="text-xs text-slate-300 space-y-1">
                        {rec.prescriptions.map((p, i) => (
                          <li key={i}>• <strong>{p.name}</strong> ({p.dosage}) - {p.frequency}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-slate-400">No active medications</div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                    <div className="text-[11px] font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5" /> Lab & Diagnostics
                    </div>
                    <div className="text-xs text-slate-300">{rec.labResults}</div>
                  </div>
                </div>

                {rec.doctorNotes && (
                  <div className="text-xs text-slate-400 bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/80">
                    <strong className="text-slate-300">Physician Notes:</strong> {rec.doctorNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
