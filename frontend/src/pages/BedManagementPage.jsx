import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Bed,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Activity,
  User,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight,
  LogOut
} from 'lucide-react';

export default function BedManagementPage() {
  const { user } = useAuth();
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('ward_icu');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [patients, setPatients] = useState([]);

  // Bed Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    wardId: 'ward_icu',
    bedId: '',
    patientId: 'usr_pat_1',
    diagnosis: 'Inpatient Monitoring & Post-Operative Recovery',
    attendingNurse: 'Nurse Rachel Green, RN'
  });
  const [assigning, setAssigning] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wardsRes, patRes] = await Promise.all([
        api.getHospitalWards(),
        api.getAllPatients()
      ]);
      const list = wardsRes.wards || [];
      setWards(list);
      setPatients(patRes.patients || []);
      if (list.length > 0 && !selectedWardId) {
        setSelectedWardId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load wards data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedWard = wards.find(w => w.id === selectedWardId) || wards[0] || null;

  const handleOpenAssign = (bedId) => {
    setAssignForm(prev => ({
      ...prev,
      wardId: selectedWardId,
      bedId
    }));
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setAssigning(true);
      const res = await api.assignPatientBed(assignForm);
      setNotification(res.message);
      setIsAssignModalOpen(false);
      await loadData();
      setTimeout(() => setNotification(''), 6000);
    } catch (err) {
      alert('Failed to assign bed: ' + err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleDischarge = async (bedId) => {
    const confirmDischarge = window.confirm(`Discharge patient from Bed ${bedId} and send bed for sanitization?`);
    if (!confirmDischarge) return;

    try {
      const res = await api.dischargePatientBed({
        wardId: selectedWardId,
        bedId
      });
      setNotification(res.message);
      await loadData();
      setTimeout(() => setNotification(''), 6000);
    } catch (err) {
      alert('Discharge failed: ' + err.message);
    }
  };

  const handleSanitize = async (bedId) => {
    try {
      const res = await api.sanitizeBed({
        wardId: selectedWardId,
        bedId
      });
      setNotification(res.message);
      await loadData();
      setTimeout(() => setNotification(''), 6000);
    } catch (err) {
      alert('Sanitization failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-600">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Loading Hospital Bed &amp; ICU Telemetry Grid...
        </p>
      </div>
    );
  }

  // Hospital-wide stats
  const totalBeds = wards.reduce((sum, w) => sum + w.totalBeds, 0);
  const totalOccupied = wards.reduce((sum, w) => sum + w.occupiedBeds, 0);
  const totalAvailable = wards.reduce((sum, w) => sum + w.availableBeds, 0);
  const occupancyRate = ((totalOccupied / totalBeds) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Action Notification */}
      {notification && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-blue-500 hover:text-blue-700">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Bed className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-outfit">
                Advanced Hospital Bed &amp; ICU Ward Logistics
              </h1>
              <p className="text-xs text-slate-500">
                Floor-by-floor occupancy management, patient intake assignments, and robotic UV-C turnover sanitization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
            Occupancy Rate: <strong className="text-blue-700">{occupancyRate}%</strong>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
            Available Beds: <strong className="text-slate-800">{totalAvailable}</strong>
          </div>
        </div>
      </div>

      {/* Wards Ribbon Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wards.map((ward) => {
          const isSelected = ward.id === selectedWardId;

          return (
            <button
              key={ward.id}
              onClick={() => setSelectedWardId(ward.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-400 shadow-sm ring-1 ring-blue-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {ward.floor}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {ward.occupiedBeds} / {ward.totalBeds} Occupied
                </span>
              </div>

              <div className="font-bold text-slate-800 text-sm font-outfit truncate">
                {ward.name}
              </div>

              <div className="text-xs text-slate-500 mt-1">
                Ratio: <strong className="text-slate-700">{ward.nurseToPatientRatio}</strong>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Available: <strong className="text-blue-700">{ward.availableBeds} beds</strong></span>
                <span>Turnover: <strong className="text-slate-700">{ward.turnoverSanitizingBeds}</strong></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Ward Interactive Beds Grid */}
      {selectedWard && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 font-outfit text-base">
                  {selectedWard.name} — Bed Allocation Matrix
                </h3>
                <p className="text-xs text-slate-500">{selectedWard.floor} • Real-time patient telemetry linkage</p>
              </div>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200 font-bold">
                {selectedWard.nurseToPatientRatio}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(selectedWard.beds || []).map((bed) => {
                const isOccupied = bed.status === 'Occupied';
                const isSanitizing = bed.status.includes('Sanitizing');

                return (
                  <div
                    key={bed.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                      isOccupied
                        ? 'bg-slate-50/80 border-slate-300'
                        : isSanitizing
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-white border-blue-300 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs text-blue-700">{bed.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isOccupied
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : isSanitizing
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {bed.status}
                        </span>
                      </div>

                      {isOccupied ? (
                        <div className="space-y-1.5 text-xs">
                          <div className="font-bold text-slate-800">{bed.patientName}</div>
                          <div className="text-[11px] text-slate-500 truncate" title={bed.diagnosis}>
                            {bed.diagnosis}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Admitted: {bed.admissionDate}
                          </div>
                          {bed.vitals && (
                            <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-600 flex justify-between">
                              <span>HR: {bed.vitals.hr}</span>
                              <span>BP: {bed.vitals.bp}</span>
                              <span>SpO2: {bed.vitals.spo2}%</span>
                            </div>
                          )}
                        </div>
                      ) : isSanitizing ? (
                        <div className="space-y-1 text-xs">
                          <span className="font-semibold text-blue-900">UV-C Sanitization in Progress</span>
                          <p className="text-[11px] text-blue-700">Robotic microbial disinfection cycle active.</p>
                        </div>
                      ) : (
                        <div className="space-y-1 text-xs text-slate-500">
                          <span className="font-semibold text-blue-700">Ready for Patient Intake</span>
                          <p className="text-[11px] text-slate-400">Cleaned, sanitized, telemetry re-zeroed.</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      {isOccupied ? (
                        <button
                          onClick={() => handleDischarge(bed.id)}
                          className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                        >
                          <LogOut className="w-3 h-3 text-slate-500" />
                          <span>Discharge Patient</span>
                        </button>
                      ) : isSanitizing ? (
                        <button
                          onClick={() => handleSanitize(bed.id)}
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Complete Sanitization</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenAssign(bed.id)}
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Assign Patient</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Patient to Bed */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <Bed className="w-5 h-5 text-blue-600" />
              <span>Assign Patient to Bed ({assignForm.bedId})</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Allocate inpatient bed and synchronize vitals telemetry with nurse station.
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Patient</label>
                <select
                  value={assignForm.patientId}
                  onChange={(e) => setAssignForm({ ...assignForm, patientId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Clinical Diagnosis</label>
                <input
                  type="text"
                  value={assignForm.diagnosis}
                  onChange={(e) => setAssignForm({ ...assignForm, diagnosis: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attending Nurse / Staff</label>
                <input
                  type="text"
                  value={assignForm.attendingNurse}
                  onChange={(e) => setAssignForm({ ...assignForm, attendingNurse: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  {assigning ? 'Assigning...' : 'Confirm Bed Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
