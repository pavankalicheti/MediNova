import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import { AlertTriangle, Heart, Activity, Thermometer, Wind, Plus, CheckCircle2, RefreshCw } from 'lucide-react';

export default function TriagePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [lastEvaluated, setLastEvaluated] = useState(null);

  const [form, setForm] = useState({
    patientName: '',
    age: '45',
    gender: 'Male',
    contact: '+1 (555) 000-1122',
    symptoms: 'Chest pain, acute shortness of breath',
    heartRate: '125',
    bpSys: '170',
    bpDia: '100',
    spo2: '88',
    temperature: '37.8'
  });

  const fetchQueue = async () => {
    try {
      const res = await api.getTriageQueue();
      setQueue(res.queue || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const symptomList = form.symptoms.split(',').map(s => s.trim());
      const res = await api.evaluateTriage({
        ...form,
        symptoms: symptomList
      });
      setLastEvaluated(res.triageEntry);
      setSuccessMsg(`AI Triage Evaluated: Priority assigned as '${res.triageEntry.priorityResult.priority}'!`);
      fetchQueue();
    } catch (err) {
      alert('Error evaluating triage: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateTriageStatus(id, status);
      fetchQueue();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>AI Emergency Scoring Engine (Phase B)</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-outfit">AI-Assisted Emergency Triage</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time weighted symptom & vitals analyzer. Calculates risk priority (Critical / Urgent / Moderate / Low) for live doctor queueing.
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          Refresh Live Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Triage Input Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white font-outfit mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            Triage Vitals & Symptoms Input
          </h2>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Name</label>
              <input
                type="text"
                name="patientName"
                required
                value={form.patientName}
                onChange={handleChange}
                placeholder="e.g. Arthur Dent"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  required
                  value={form.age}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Vitals Section Grid */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Patient Vitals</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    name="heartRate"
                    required
                    value={form.heartRate}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-white focus:border-teal-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    SpO2 Oxygen (%)
                  </label>
                  <input
                    type="number"
                    name="spo2"
                    required
                    value={form.spo2}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-white focus:border-teal-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">BP Systolic (mmHg)</label>
                  <input
                    type="number"
                    name="bpSys"
                    required
                    value={form.bpSys}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-white focus:border-teal-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    required
                    value={form.temperature}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-white focus:border-teal-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Presenting Symptoms (Comma Separated)</label>
              <textarea
                name="symptoms"
                rows="2"
                required
                value={form.symptoms}
                onChange={handleChange}
                placeholder="e.g. chest pain, dizziness, severe shortness of breath..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? 'Running Triage Engine...' : 'Evaluate & Queue Emergency Case'}
            </button>
          </form>

          {/* AI Result Banner */}
          {lastEvaluated && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">AI Priority Calculated</span>
                <PriorityBadge priority={lastEvaluated.priorityResult.priority} score={lastEvaluated.priorityResult.score} />
              </div>
              <div className="text-xs text-slate-400">
                <strong>Recommended Action:</strong> {lastEvaluated.priorityResult.recommendedAction}
              </div>
              <div className="text-xs text-slate-400">
                <strong>Assigned Unit:</strong> {lastEvaluated.priorityResult.department}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Doctor Live Emergency Queue */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                  Live Doctor ER Queue
                </h2>
                <p className="text-xs text-slate-400">Auto-sorted by priority level & weighted AI clinical score</p>
              </div>
              <span className="text-xs bg-slate-800 text-teal-400 font-mono px-2.5 py-1 rounded-lg border border-slate-700">
                {queue.length} Cases Active
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading live ER queue...</div>
            ) : queue.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No emergency cases in queue.</div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {queue.map((item) => {
                  const pRes = item.priorityResult || {};
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        pRes.priority === 'Critical'
                          ? 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-500/5'
                          : pRes.priority === 'Urgent'
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-slate-800/50 border-slate-700/60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-outfit">{item.patientName}</span>
                            <span className="text-xs text-slate-400">({item.age}y, {item.gender})</span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">Submitted: {new Date(item.submittedAt).toLocaleTimeString()}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={pRes.priority} score={pRes.score} />
                        </div>
                      </div>

                      {/* Vitals Summary Pill Row */}
                      <div className="grid grid-cols-4 gap-2 my-2 py-2 px-3 rounded-lg bg-slate-950/60 text-[11px] font-mono border border-slate-800">
                        <div>HR: <strong className={item.heartRate > 110 ? 'text-red-400' : 'text-slate-200'}>{item.heartRate} bpm</strong></div>
                        <div>SpO2: <strong className={item.spo2 < 94 ? 'text-red-400' : 'text-slate-200'}>{item.spo2}%</strong></div>
                        <div>BP: <strong className="text-slate-200">{item.bpSys}/{item.bpDia}</strong></div>
                        <div>Temp: <strong className="text-slate-200">{item.temperature}°C</strong></div>
                      </div>

                      <div className="text-xs text-slate-300 mb-3">
                        <strong className="text-slate-400">Symptoms:</strong> {item.symptoms}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-slate-400">Status: <strong className="text-teal-400">{item.status}</strong></span>
                        <div className="flex items-center gap-2">
                          {item.status !== 'Triaged' && (
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'Triaged')}
                              className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30 text-[11px] transition font-medium"
                            >
                              Mark Triaged
                            </button>
                          )}
                          {item.status !== 'Admitted to ER' && (
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'Admitted to ER')}
                              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 text-[11px] transition font-medium"
                            >
                              Admit to Trauma Bay
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
