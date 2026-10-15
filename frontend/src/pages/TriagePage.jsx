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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>AI Emergency Scoring Engine (Phase B)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 font-outfit">AI-Assisted Emergency Triage</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time weighted symptom & vitals analyzer. Calculates risk priority (Critical / Urgent / Moderate / Low) for live doctor queueing.
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          Refresh Live Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Triage Input Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 font-outfit mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Triage Vitals & Symptoms Input
          </h2>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Name</label>
              <input
                type="text"
                name="patientName"
                required
                value={form.patientName}
                onChange={handleChange}
                placeholder="e.g. Arthur Dent"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  required
                  value={form.age}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Vitals Section Grid */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Patient Vitals</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-blue-500" />
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    name="heartRate"
                    required
                    value={form.heartRate}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-sky-500" />
                    SpO2 Oxygen (%)
                  </label>
                  <input
                    type="number"
                    name="spo2"
                    required
                    value={form.spo2}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">BP Systolic (mmHg)</label>
                  <input
                    type="number"
                    name="bpSys"
                    required
                    value={form.bpSys}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-blue-500" />
                    Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    required
                    value={form.temperature}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Presenting Symptoms (Comma Separated)</label>
              <textarea
                name="symptoms"
                rows="2"
                required
                value={form.symptoms}
                onChange={handleChange}
                placeholder="e.g. chest pain, dizziness, severe shortness of breath..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? 'Running Triage Engine...' : 'Evaluate & Queue Emergency Case'}
            </button>
          </form>

          {/* AI Result Banner */}
          {lastEvaluated && (
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">AI Priority Calculated</span>
                <PriorityBadge priority={lastEvaluated.priorityResult.priority} score={lastEvaluated.priorityResult.score} />
              </div>
              <div className="text-xs text-slate-500">
                <strong>Recommended Action:</strong> {lastEvaluated.priorityResult.recommendedAction}
              </div>
              <div className="text-xs text-slate-500">
                <strong>Assigned Unit:</strong> {lastEvaluated.priorityResult.department}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Doctor Live Emergency Queue */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-outfit flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 animate-pulse" />
                  Live Doctor ER Queue
                </h2>
                <p className="text-xs text-slate-500">Auto-sorted by priority level & weighted AI clinical score</p>
              </div>
              <span className="text-xs bg-slate-100 text-blue-600 font-mono px-2.5 py-1 rounded-lg border border-slate-200">
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
                          ? 'bg-blue-50/80 border-blue-300 shadow-sm'
                          : pRes.priority === 'Urgent'
                          ? 'bg-sky-50/60 border-sky-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800 font-outfit">{item.patientName}</span>
                            <span className="text-xs text-slate-500">({item.age}y, {item.gender})</span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">Submitted: {new Date(item.submittedAt).toLocaleTimeString()}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={pRes.priority} score={pRes.score} />
                        </div>
                      </div>

                      {/* Vitals Summary Pill Row */}
                      <div className="grid grid-cols-4 gap-2 my-2 py-2 px-3 rounded-lg bg-white text-[11px] font-mono border border-slate-200">
                        <div>HR: <strong className={item.heartRate > 110 ? 'text-blue-600' : 'text-slate-700'}>{item.heartRate} bpm</strong></div>
                        <div>SpO2: <strong className={item.spo2 < 94 ? 'text-blue-600' : 'text-slate-700'}>{item.spo2}%</strong></div>
                        <div>BP: <strong className="text-slate-700">{item.bpSys}/{item.bpDia}</strong></div>
                        <div>Temp: <strong className="text-slate-700">{item.temperature}°C</strong></div>
                      </div>

                      <div className="text-xs text-slate-600 mb-3">
                        <strong className="text-slate-500">Symptoms:</strong> {item.symptoms}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <span className="text-slate-500">Status: <strong className="text-blue-600">{item.status}</strong></span>
                        <div className="flex items-center gap-2">
                          {item.status !== 'Triaged' && (
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'Triaged')}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 text-[11px] transition font-medium"
                            >
                              Mark Triaged
                            </button>
                          )}
                          {item.status !== 'Admitted to ER' && (
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'Admitted to ER')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg border border-blue-600 text-[11px] transition font-medium"
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
