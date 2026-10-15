import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  Wifi,
  Radio,
  Sliders,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  Plus,
  Eye,
  Crosshair,
  Maximize2
} from 'lucide-react';

export default function RoboticSurgeryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('console'); // 'console', 'kinematics', 'schedule', 'audit'
  const [suites, setSuites] = useState([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState('or_suite_4');
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [logs, setLogs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Procedural Actions State
  const [actionNotice, setActionNotice] = useState('');
  const [calibrating, setCalibrating] = useState(false);
  const [switchingControl, setSwitchingControl] = useState(false);

  // Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    suiteId: 'or_suite_4',
    patientId: 'usr_pat_1',
    procedureName: 'Robotic Mitral Valve Annuloplasty',
    leadSurgeon: 'Dr. Marcus Vance (Remote Console)',
    plannedDate: '2026-10-18'
  });
  const [scheduling, setScheduling] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [suitesRes, logsRes, patRes] = await Promise.all([
        api.getRoboticSuites(),
        api.getRoboticSurgicalLogs(),
        api.getAllPatients()
      ]);

      const suiteList = suitesRes.suites || [];
      setSuites(suiteList);
      setLogs(logsRes.logs || []);
      setPatients(patRes.patients || []);

      const active = suiteList.find(s => s.id === selectedSuiteId) || suiteList[0] || null;
      setSelectedSuite(active);
      if (active) {
        setSelectedSuiteId(active.id);
        setScheduleForm(prev => ({ ...prev, suiteId: active.id }));
      }
    } catch (err) {
      console.error('Failed to load robotic surgical data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When suite changes
  const handleSelectSuite = (suiteId) => {
    setSelectedSuiteId(suiteId);
    const found = suites.find(s => s.id === suiteId);
    if (found) setSelectedSuite(found);
  };

  // Master Control Handoff
  const handleToggleControl = async () => {
    if (!selectedSuite) return;
    try {
      setSwitchingControl(true);
      const isCurrentlyRemote = selectedSuite.status.includes('Live Tele-Presence');
      const targetMode = isCurrentlyRemote ? 'bedside' : 'remote';
      const res = await api.switchRoboticControl(selectedSuite.id, targetMode);
      setSelectedSuite(res.suite);
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(''), 6000);
      const logRes = await api.getRoboticSurgicalLogs();
      setLogs(logRes.logs || []);
    } catch (err) {
      alert('Failed to switch master control: ' + err.message);
    } finally {
      setSwitchingControl(false);
    }
  };

  // Calibrate Haptic Telemetry
  const handleCalibrate = async () => {
    if (!selectedSuite) return;
    try {
      setCalibrating(true);
      const res = await api.calibrateRoboticSuite(selectedSuite.id);
      setSelectedSuite(res.suite);
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(''), 6000);
      const logRes = await api.getRoboticSurgicalLogs();
      setLogs(logRes.logs || []);
    } catch (err) {
      alert('Failed to calibrate suite: ' + err.message);
    } finally {
      setCalibrating(false);
    }
  };

  // Emergency Soft Stop
  const handleEmergencyStop = async () => {
    if (!selectedSuite) return;
    const confirmStop = window.confirm(
      'EMERGENCY STOP WARNING:\nAre you sure you want to lock and freeze all robotic arms immediately?'
    );
    if (!confirmStop) return;

    try {
      const res = await api.emergencyStopRoboticSuite(selectedSuite.id);
      setSelectedSuite(res.suite);
      setActionNotice('EMERGENCY SOFT-STOP EXECUTED: All kinetic joints clamped in anatomical safe position.');
      const logRes = await api.getRoboticSurgicalLogs();
      setLogs(logRes.logs || []);
    } catch (err) {
      alert('Failed to execute emergency stop: ' + err.message);
    }
  };

  // Submit Schedule Form
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setScheduling(true);
      const res = await api.scheduleRoboticSurgery(scheduleForm);
      setActionNotice(res.message);
      setIsScheduleModalOpen(false);
      await loadData();
      setTimeout(() => setActionNotice(''), 6000);
    } catch (err) {
      alert('Failed to schedule procedure: ' + err.message);
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-600">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Connecting to Robotic Operating Suites &amp; 5G Tele-Presencing...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice('')} className="text-blue-500 hover:text-blue-700">
            &times;
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-outfit">
                Robotic Surgical Tele-Presence &amp; Tele-Operation
              </h1>
              <p className="text-xs text-slate-500">
                Sub-millisecond haptic tele-manipulation, stereoscopic 3D vision, and bi-directional kinematic guardrails.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Haptic Calibration Button */}
          <button
            onClick={handleCalibrate}
            disabled={calibrating}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Wifi className={`w-3.5 h-3.5 text-blue-600 ${calibrating ? 'animate-spin' : ''}`} />
            <span>{calibrating ? 'Syncing...' : 'Calibrate 1000Hz Haptics'}</span>
          </button>

          {/* Master Control Handoff Button */}
          <button
            onClick={handleToggleControl}
            disabled={switchingControl}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>
              {selectedSuite?.status.includes('Live Tele-Presence')
                ? 'Relinquish to Bedside'
                : 'Take Master Remote Control'}
            </span>
          </button>

          {/* Emergency Stop Button */}
          <button
            onClick={handleEmergencyStop}
            className="px-3.5 py-2 bg-slate-100 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-700 hover:text-blue-900 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
            <span>Emergency Soft-Stop</span>
          </button>

          {/* Schedule Surgery Button */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Schedule Case</span>
          </button>
        </div>
      </div>

      {/* Suite Selector Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suites.map((st) => {
          const isSelected = st.id === selectedSuiteId;
          const isLive = st.status.includes('Live Tele-Presence');

          return (
            <button
              key={st.id}
              onClick={() => handleSelectSuite(st.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-400 shadow-sm ring-1 ring-blue-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {st.id.toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isLive
                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {isLive ? '● Live Stream' : st.status}
                </span>
              </div>

              <div className="font-bold text-slate-800 text-sm font-outfit truncate">
                {st.name}
              </div>

              <div className="text-xs text-slate-500 mt-1">
                Procedure: <strong className="text-slate-700">{st.currentProcedure || 'Standby'}</strong>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Latency: <strong className="text-blue-700 font-bold">{st.latencyMs}ms</strong></span>
                <span>Haptics: <strong className="text-slate-700">{st.hapticRefreshRateHz}Hz</strong></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Suite Telemetry Ribbon */}
      {selectedSuite && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Remote Lead Tele-Surgeon</span>
              <div className="font-bold text-slate-800 text-xs truncate">
                {selectedSuite.activeSurgeon}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">In-Room Bedside Assistant</span>
              <div className="font-bold text-slate-800 text-xs truncate">
                {selectedSuite.inRoomSurgeon}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Network Slice Mode</span>
              <div className="font-semibold text-blue-700 text-xs truncate">
                {selectedSuite.networkMode}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Stereoscopic Vision Feed</span>
              <div className="font-bold text-slate-800 text-xs font-mono">
                {selectedSuite.videoResolution} @ {selectedSuite.videoStreamFps}fps
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Kinematic Guardrails</span>
              <div className="font-bold text-blue-800 text-xs font-mono">
                {selectedSuite.workspaceBoundaries}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('console')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'console'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>Surgical Tele-Presence Console</span>
        </button>

        <button
          onClick={() => setActiveTab('kinematics')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'kinematics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Arm Kinematics ({selectedSuite?.arms?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Kinematic Log &amp; Safety Events</span>
        </button>
      </div>

      {/* TAB 1: SURGICAL TELE-PRESENCE CONSOLE */}
      {activeTab === 'console' && selectedSuite && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visualizer (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
              {/* Top Viewport HUD Overlay */}
              <div className="p-3 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="font-mono font-bold tracking-wider uppercase text-[11px]">
                    4K Stereoscopic 3D Surgical Stream • {selectedSuite.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-300">
                  <span>Latency: <strong className="text-blue-400 font-bold">{selectedSuite.latencyMs}ms</strong></span>
                  <span>Jitter: {selectedSuite.jitterMs}ms</span>
                  <span>Loss: {selectedSuite.packetLossPercent}%</span>
                </div>
              </div>

              {/* Viewport Simulation Canvas */}
              <div className="h-80 bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden">
                {/* Crosshairs & Anatomical Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-72 h-72 border border-blue-400 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-blue-400 rounded-full"></div>
                  </div>
                  <div className="absolute w-full h-[1px] bg-blue-400/40"></div>
                  <div className="absolute h-full w-[1px] bg-blue-400/40"></div>
                </div>

                {/* Simulated Instrument Render Area */}
                <div className="relative text-center z-10 space-y-3">
                  <div className="inline-block p-4 bg-slate-900/90 border border-blue-500/40 rounded-2xl backdrop-blur-md shadow-2xl">
                    <Crosshair className="w-10 h-10 text-blue-400 mx-auto animate-pulse" />
                    <div className="text-white font-bold text-sm mt-2 font-outfit">
                      {selectedSuite.currentProcedure}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                      Target Patient: {selectedSuite.patientName} • Safe-Zone Locked
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-blue-300">
                    <span className="bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800">
                      Tremor Suppression: {selectedSuite.tremorFilter}
                    </span>
                    <span className="bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800">
                      Haptic Loop: {selectedSuite.hapticRefreshRateHz}Hz
                    </span>
                  </div>
                </div>

                {/* Bottom Viewport HUD */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Safety Interlock: <strong className="text-white">{selectedSuite.safetyInterlock}</strong></span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Encrypted Session ID: TLS-5G-00921-E2E
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Instrument Overview Under Console */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(selectedSuite.arms || []).map((arm) => (
                <div key={arm.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{arm.name}</span>
                  <div className="text-xs font-bold text-slate-800 truncate" title={arm.tool}>
                    {arm.tool}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 font-mono">
                    <span>Angle: <strong>{arm.jointAngleDeg}°</strong></span>
                    <span>Force: <strong className="text-blue-700">{arm.gripForceN}N</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Clinical Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Patient OR Vitals Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Intraoperative Vitals Telemetry
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  Synchronized
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Heart Rate</span>
                  <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                    {selectedSuite.vitalTelemetry.patientHeartRate} <span className="text-xs font-normal text-slate-500">bpm</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Arterial BP</span>
                  <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                    {selectedSuite.vitalTelemetry.arterialBp}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Perfusion Index</span>
                  <div className="text-base font-bold text-blue-700 font-mono mt-0.5">
                    {selectedSuite.vitalTelemetry.perfusionIndex}%
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">End-Tidal CO₂</span>
                  <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                    {selectedSuite.vitalTelemetry.etCO2} <span className="text-xs font-normal text-slate-500">mmHg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Surgical Team & Tele-Console Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                Surgical Team Configuration
              </span>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500">Tele-Surgeon:</span>
                  <span className="font-bold text-slate-800">{selectedSuite.activeSurgeon}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500">Bedside Lead:</span>
                  <span className="font-bold text-slate-800">{selectedSuite.inRoomSurgeon}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500">Anesthesiologist:</span>
                  <span className="font-bold text-slate-800">{selectedSuite.anesthesiologist}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-ARM KINEMATICS */}
      {activeTab === 'kinematics' && selectedSuite && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 font-outfit text-sm">
                Robotic Instrument Arm Kinematics &amp; Sensors ({selectedSuite.name})
              </h3>
              <p className="text-xs text-slate-500">
                Joint positioning angles, sensor grip forces, and thermal tip monitoring.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
              Active Kinematics
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {(selectedSuite.arms || []).map((arm) => (
              <div key={arm.id} className="p-5 hover:bg-slate-50/70 transition space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded-xl border border-blue-200">
                      {arm.id.toUpperCase()}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{arm.name}</div>
                      <div className="text-xs text-slate-500 font-mono">Tool: {arm.tool}</div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {arm.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Joint Angle Rotation</span>
                    <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{arm.jointAngleDeg}° Pitch / Yaw</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Applied Grip Force</span>
                    <div className="text-sm font-bold text-blue-700 font-mono mt-0.5">{arm.gripForceN} Newtons</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Instrument Tip Thermometry</span>
                    <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{arm.temperatureC}°C (Safe Margin)</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KINEMATIC AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 font-outfit text-sm">
              Tele-Surgical Kinematic &amp; Control Event Ledger
            </h3>
            <span className="text-xs text-slate-500">{logs.length} Log Entries</span>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No events logged yet.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{log.eventType}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-700">{log.surgeon}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()} • Latency: {log.networkLatency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE ROBOTIC SURGERY */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Schedule Tele-Robotic Surgical Operation</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Book operating suite and establish encrypted ultra-low latency tele-presence connection.
            </p>

            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Patient</label>
                <select
                  value={scheduleForm.patientId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, patientId: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Robotic Surgical Suite</label>
                <select
                  value={scheduleForm.suiteId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, suiteId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  {suites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Procedure Description</label>
                <input
                  type="text"
                  value={scheduleForm.procedureName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, procedureName: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lead Tele-Surgeon (Remote Station)</label>
                <input
                  type="text"
                  value={scheduleForm.leadSurgeon}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, leadSurgeon: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm Case Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
