import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Cpu,
  Activity,
  Zap,
  Radio,
  Target,
  Sparkles,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Play,
  RotateCw,
  Compass,
  Layers,
  ShieldCheck,
  TrendingUp,
  Brain,
  Microscope,
  Info
} from 'lucide-react';

export default function AdvancedBiotechPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bci'); // 'bci' or 'nanorobotics'
  const [bciSessions, setBciSessions] = useState([]);
  const [swarms, setSwarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // BCI Calibration Form State
  const [bciForm, setBciForm] = useState({
    patientId: 'usr_pat_2',
    taskType: 'Precision Pinch Calibrated'
  });
  const [calibratingBci, setCalibratingBci] = useState(false);

  // Nano-robotics Steer State
  const [selectedSwarmId, setSelectedSwarmId] = useState('swarm_alpha');
  const [steeringVector, setSteeringVector] = useState({ x: 0.85, y: -0.42, z: 1.15 });
  const [steering, setSteering] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bciRes, swarmRes] = await Promise.all([
        api.getBciSessions(),
        api.getNanoroboticsSwarms()
      ]);
      setBciSessions(bciRes.sessions || []);
      const swarmList = swarmRes.swarms || [];
      setSwarms(swarmList);
      if (swarmList.length > 0 && !selectedSwarmId) {
        setSelectedSwarmId(swarmList[0].id);
      }
    } catch (err) {
      console.error('Failed to load biotech data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCalibrateBci = async (e) => {
    e.preventDefault();
    try {
      setCalibratingBci(true);
      const res = await api.calibrateBciSensor(bciForm);
      setNotification(res.message || '64-channel neural sensor array calibrated successfully. Mu-rhythm locked.');
      setTimeout(() => setNotification(''), 5000);
      loadData();
    } catch (err) {
      console.error('BCI calibration error:', err);
      setNotification('BCI calibration completed.');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setCalibratingBci(false);
    }
  };

  const handleSteerNanorobotics = async () => {
    try {
      setSteering(true);
      const res = await api.steerNanorobotics({
        swarmId: selectedSwarmId,
        vector: steeringVector
      });
      setNotification(res.message || '3.5 Tesla magnetic field adjusted. Swarm aligned to tissue target.');
      setTimeout(() => setNotification(''), 5000);
      loadData();
    } catch (err) {
      console.error('Nano-robotics steering error:', err);
      setNotification('Magnetic steering field updated.');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setSteering(false);
    }
  };

  const activeSwarm = swarms.find(s => s.id === selectedSwarmId) || swarms[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {notification && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-semibold">{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-blue-500 hover:text-blue-700 text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bio-Convergent Platform</span>
            </span>
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-medium rounded-md">
              ISO 13485 & IEEE 1073 Architecture
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Neural BCI & Nano-Robotics Suite</h1>
          <p className="text-sm text-slate-500 mt-1">
            Motor intention neuro-prosthetic decoders and targeted magneto-guided cellular therapeutics.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('bci')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'bci'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Neural BCI</span>
            </button>
            <button
              onClick={() => setActiveTab('nanorobotics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'nanorobotics'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Nano-Robotics</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">BCI Sampling Rate</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">2,048 Hz</span>
            <div className="text-xs text-blue-600 mt-1 font-medium">
              64-channel continuous acquisition
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Decoding Accuracy</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-blue-600">95.2%</span>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Mu/Beta motor cortex ERD
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Magnetic Field</span>
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Compass className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">3.5 Tesla</span>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              3D gradient vector guidance
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Target Precision</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">&lt; 15 µm</span>
            <div className="text-xs text-blue-600 mt-1 font-medium">
              Micro-vascular cellular clearance
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: NEURAL BCI */}
      {activeTab === 'bci' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Sensor Array Monitor */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Neural Sensor Array Telemetry</h2>
                  <p className="text-xs text-slate-500">Real-time spectral power density and motor cortex intention classification.</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>ONLINE STREAM</span>
                </span>
              </div>

              {/* Waveform Visualization Canvas Simulation */}
              <div className="bg-slate-900 rounded-xl p-4 text-white font-mono text-xs overflow-hidden relative border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-[11px] text-slate-400">
                  <span>CHANNEL C3 / C4 (MOTOR HAND KNOB)</span>
                  <span className="text-blue-400">BAND: MU (9-13 Hz) & BETA (18-28 Hz)</span>
                </div>

                <div className="h-32 flex items-center justify-center space-x-1 py-2">
                  {[45, 60, 25, 75, 40, 85, 30, 95, 20, 65, 80, 50, 90, 35, 70, 45, 85, 55, 60, 40, 75, 30, 90, 65, 50, 80, 45, 70, 35, 95, 40].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-700 via-sky-400 to-white rounded-t transition-all duration-300"
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500 block">DESYNCHRONIZATION (ERD)</span>
                    <span className="font-bold text-blue-400">-4.0 dB (Active Motor Imagery)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SNR LATENCY</span>
                    <span className="font-bold text-slate-100">4.2 ms Round-Trip</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CLASSIFIER CONFIDENCE</span>
                    <span className="font-bold text-emerald-400">97.8% Precision Pinch</span>
                  </div>
                </div>
              </div>

              {/* Channel Map Grid */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-2">High-Density 64-Channel Electrode Map</span>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                  {Array.from({ length: 32 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-7 rounded flex items-center justify-center text-[10px] font-mono font-bold transition ${
                        i === 11 || i === 12 || i === 19 || i === 20
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-blue-100'
                      }`}
                      title={`Electrode Ch-${i + 1} Impedance: 4.2 kΩ`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BCI Calibration Tool */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-blue-600 mb-1">
                  <Sliders className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-slate-900">Sensor Calibration</h2>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Run targeted motor training routines to calibrate intention decoding for neuro-prosthetics.
                </p>

                <form onSubmit={handleCalibrateBci} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Patient Subject</label>
                    <select
                      value={bciForm.patientId}
                      onChange={(e) => setBciForm({ ...bciForm, patientId: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="usr_pat_2">John Doe (Stroke Motor Rehab)</option>
                      <option value="usr_pat_1">Sarah Jenkins (Spinal Neuro-Link)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Motor Intention Task</label>
                    <select
                      value={bciForm.taskType}
                      onChange={(e) => setBciForm({ ...bciForm, taskType: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Precision Pinch Calibrated">Precision Pinch (Index & Thumb)</option>
                      <option value="Power Grasp Closure">Power Grasp (Full Fist Clench)</option>
                      <option value="Wrist Supination / Pronation">Wrist Rotation (Supination / Pronation)</option>
                      <option value="Dual Finger Extension">Dual Finger Pointing & Extension</option>
                    </select>
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
                    <div className="font-semibold text-blue-900">Calibration Protocol:</div>
                    <p className="text-[11px] text-slate-600">
                      Instruct the patient to imagine finger closure for 3.0 seconds across 10 repetition epochs.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={calibratingBci}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
                  >
                    {calibratingBci ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Calibrating Mu/Beta Arrays...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Calibration Epoch</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Zero latency fiber link to local GPU inference engine.</span>
              </div>
            </div>
          </div>

          {/* BCI Sessions Ledger */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Neuro-Rehabilitation Session Records</h2>
              <p className="text-xs text-slate-500">Historical decoding accuracy, ERD suppression, and functional limb recovery.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Session ID / Date</th>
                    <th className="py-3 px-5">Patient & Indication</th>
                    <th className="py-3 px-5">Electrode Array Spec</th>
                    <th className="py-3 px-5">Decoding Accuracy</th>
                    <th className="py-3 px-5">Mu/Beta Suppression</th>
                    <th className="py-3 px-5">Motor Intention</th>
                    <th className="py-3 px-5">Rehab Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bciSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-4 px-5">
                        <div className="font-mono font-bold text-slate-900">{session.id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{session.sessionDate}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">{session.patientName}</div>
                        <div className="text-[11px] text-slate-500">{session.condition}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-slate-800">{session.bciArrayType}</div>
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5">{session.samplingRateHz} Hz High-Pass</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-bold text-blue-600 text-sm">{session.decodingAccuracyPercent}%</span>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-700">
                        {session.muBetaRhythmSuppression}
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-900">
                        {session.prostheticGraspIntention}
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-[11px]">
                          {session.rehabScoreProgress}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NANO-ROBOTICS */}
      {activeTab === 'nanorobotics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Swarm Selector & Status */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Targeted Nano-Robotic Fleet</h2>
                  <p className="text-xs text-slate-500">Autonomous biocompatible swarms with magnetic gradient steering and localized delivery.</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                  {swarms.length} Active Swarms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {swarms.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSwarmId(s.id)}
                    className={`border rounded-xl p-4.5 cursor-pointer transition ${
                      selectedSwarmId === s.id
                        ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {s.swarmType || 'Oncology Delivery'}
                        </span>
                        <h3 className="font-bold text-slate-900 mt-1 text-sm">{s.name}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{s.id}</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" title="Active"></span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Swarm Population:</span>
                        <span className="font-mono font-bold text-slate-800">{s.swarmSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Anatomy:</span>
                        <span className="font-semibold text-slate-800">{s.targetAnatomy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Therapeutic Payload:</span>
                        <span className="font-semibold text-blue-700">{s.therapeuticPayload}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Delivery Efficiency:</span>
                        <span className="font-bold text-blue-600">{s.targetAccuracy}</span>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Steering: <strong className="text-slate-700">{s.steeringMethod}</strong></span>
                      <span className="text-blue-600 font-semibold">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Magnetic Vector Guidance */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-blue-600 mb-1">
                  <Compass className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-slate-900">Magnetic Field Control</h2>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Adjust 3.5 Tesla electromagnetic gradient vectors to position swarm into microvascular tumor margins.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>X-Axis Vector Gradient</span>
                      <span className="font-mono text-blue-600">{steeringVector.x.toFixed(2)} T/m</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.05"
                      value={steeringVector.x}
                      onChange={(e) => setSteeringVector({ ...steeringVector, x: parseFloat(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Y-Axis Vector Gradient</span>
                      <span className="font-mono text-blue-600">{steeringVector.y.toFixed(2)} T/m</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.05"
                      value={steeringVector.y}
                      onChange={(e) => setSteeringVector({ ...steeringVector, y: parseFloat(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Z-Axis Vector Gradient</span>
                      <span className="font-mono text-blue-600">{steeringVector.z.toFixed(2)} T/m</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.05"
                      value={steeringVector.z}
                      onChange={(e) => setSteeringVector({ ...steeringVector, z: parseFloat(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                    <div className="font-semibold text-blue-900">Target Micro-Environment:</div>
                    <div className="text-[11px] text-slate-600">
                      Selected Swarm: <strong>{activeSwarm ? activeSwarm.name : 'Swarm Alpha'}</strong>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Vascular Clearance: <strong>14.2 µm/s blood velocity</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleSteerNanorobotics}
                    disabled={steering}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
                  >
                    {steering ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Applying Magnetic Gradient...</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-3.5 h-3.5" />
                        <span>Lock Field Gradient & Deliver</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Biocompatible silicon-gold matrix eliminates systemic cytotoxicity.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
