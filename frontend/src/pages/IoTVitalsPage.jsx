import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Activity,
  Heart,
  Droplet,
  Thermometer,
  Wind,
  Wifi,
  BatteryCharging,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  Sliders,
  Shield,
  Smartphone,
  Watch
} from 'lucide-react';

export default function IoTVitalsPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveStreaming, setLiveStreaming] = useState(true);

  // Modals & Forms
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [pairForm, setPairForm] = useState({
    deviceName: 'Apple Watch Series 9 BioTelemetry',
    model: 'Apple Watch Series 9 (Cellular)',
    type: 'Smartwatch & ECG',
    connectionType: 'Bluetooth 5.3 + LTE'
  });
  const [pairing, setPairing] = useState(false);

  // Notification Banner
  const [actionNotice, setActionNotice] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [devRes, telemRes, altRes] = await Promise.all([
        api.getIotDevices(),
        api.getIotTelemetry(),
        api.getIotAlerts()
      ]);
      setDevices(devRes.devices || []);
      if (devRes.devices?.length > 0 && !selectedDevice) {
        setSelectedDevice(devRes.devices[0]);
      } else if (devRes.devices?.length > 0 && selectedDevice) {
        const updated = devRes.devices.find(d => d.id === selectedDevice.id);
        if (updated) setSelectedDevice(updated);
      }
      setTelemetry(telemRes.telemetryLogs || []);
      setAlerts(altRes.alerts || []);
    } catch (err) {
      console.error('Failed to load IoT data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Live telemetry pulse simulation (gently oscillates vitals when live streaming is ON)
  useEffect(() => {
    let interval;
    if (liveStreaming && selectedDevice) {
      interval = setInterval(() => {
        const hrJitter = Math.floor(Math.random() * 3) - 1;
        const newHr = Math.max(58, Math.min(115, selectedDevice.currentVitals.heartRate + hrJitter));
        const newSpo2 = Math.min(100, Math.max(94, selectedDevice.currentVitals.spO2 + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)));

        setSelectedDevice(prev => {
          if (!prev) return null;
          return {
            ...prev,
            lastSync: new Date().toISOString(),
            currentVitals: {
              ...prev.currentVitals,
              heartRate: newHr,
              spO2: newSpo2
            }
          };
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [liveStreaming, selectedDevice]);

  const handlePairDevice = async (e) => {
    e.preventDefault();
    try {
      setPairing(true);
      const res = await api.pairIotDevice(pairForm);
      setIsPairModalOpen(false);
      setActionNotice(`Successfully paired ${res.device.deviceName}!`);
      setTimeout(() => setActionNotice(''), 3500);
      await loadData();
    } catch (err) {
      alert('Failed to pair device: ' + err.message);
    } finally {
      setPairing(false);
    }
  };

  const handleSyncNow = async (devId) => {
    try {
      await api.syncIotDevice(devId);
      setActionNotice('Telemetry synchronized with device cloud.');
      setTimeout(() => setActionNotice(''), 3000);
      await loadData();
    } catch (err) {
      alert('Sync failed: ' + err.message);
    }
  };

  const handleDisconnect = async (devId) => {
    if (!window.confirm('Are you sure you want to unpair this IoT wearable?')) return;
    try {
      await api.disconnectIotDevice(devId);
      setActionNotice('Device successfully unpaired.');
      setTimeout(() => setActionNotice(''), 3000);
      setSelectedDevice(null);
      await loadData();
    } catch (err) {
      alert('Failed to disconnect: ' + err.message);
    }
  };

  const vitals = selectedDevice?.currentVitals || {
    heartRate: 74,
    spO2: 98,
    bpSys: 120,
    bpDia: 80,
    temperature: 36.8,
    bloodGlucose: 102,
    respirationRate: 16
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold font-outfit text-slate-800">IoT Wearable Vitals Monitor</h1>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              Continuous Telemetry Active
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Real-time biometric sensor streaming for continuous cardiac, oxygen saturation, glucose, and hemodynamics tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiveStreaming(!liveStreaming)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
              liveStreaming
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${liveStreaming ? 'bg-blue-600 animate-ping' : 'bg-slate-400'}`}></span>
            <span>{liveStreaming ? 'Live Stream Active' : 'Live Stream Paused'}</span>
          </button>

          <button
            onClick={() => setIsPairModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Pair New Wearable</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2 font-medium animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Paired Device Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((dev) => {
          const isSelected = selectedDevice?.id === dev.id;
          return (
            <div
              key={dev.id}
              onClick={() => setSelectedDevice(dev)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-300 shadow-sm ring-1 ring-blue-300'
                  : 'bg-white border-slate-200 hover:border-blue-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Watch className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-800 truncate">{dev.deviceName}</span>
                  </div>
                  <span className="text-[10px] bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-bold">
                    {dev.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 mb-2">
                  Patient: <strong className="text-slate-700">{dev.patientName}</strong> • {dev.model}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-blue-600" />
                    {dev.battery}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-blue-500" />
                    {dev.signalStrength} dBm
                  </span>
                  <span>{dev.connectionType}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100/80 mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Last Sync: {new Date(dev.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSyncNow(dev.id);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition"
                    title="Force Telemetry Sync"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDisconnect(dev.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded transition"
                    title="Unpair Device"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Real-Time Telemetry Stage */}
      {selectedDevice ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Real-Time Vital Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Heart Rate */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-blue-600 fill-blue-600 animate-pulse" />
                    <span>Heart Rate</span>
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
                    Target: 60-100
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-outfit text-slate-900">{vitals.heartRate}</span>
                  <span className="text-xs font-bold text-slate-400">BPM</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Sinus rhythm regular</span>
                </div>
              </div>

              {/* SpO2 Pulse Oximetry */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-sky-600" />
                    <span>Blood Oxygen (SpO2)</span>
                  </span>
                  <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-mono font-bold">
                    &ge; 95%
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-outfit text-blue-800">{vitals.spO2}%</span>
                  <span className="text-xs font-bold text-slate-400">Saturation</span>
                </div>
                <div className="text-[11px] text-blue-700 font-medium">Optimal arterial oxygenation</div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Blood Pressure</span>
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                    Sys / Dia
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-outfit text-slate-900">
                    {vitals.bpSys}/{vitals.bpDia}
                  </span>
                  <span className="text-xs font-bold text-slate-400">mmHg</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  MAP: {Math.round((vitals.bpSys + 2 * vitals.bpDia) / 3)} mmHg (Normal)
                </div>
              </div>

              {/* Blood Glucose */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-blue-600" />
                    <span>CGM Blood Glucose</span>
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
                    Target: 70-140
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-outfit text-slate-900">{vitals.bloodGlucose}</span>
                  <span className="text-xs font-bold text-slate-400">mg/dL</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Stable glycemic curve</span>
                </div>
              </div>

              {/* Body Temperature */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-blue-600" />
                    <span>Core Temperature</span>
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                    Afebrile
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-outfit text-slate-900">{vitals.temperature}°C</span>
                  <span className="text-xs font-bold text-slate-400">({(vitals.temperature * 1.8 + 32).toFixed(1)}°F)</span>
                </div>
                <div className="text-[11px] text-slate-500">Normal thermal equilibrium</div>
              </div>

              {/* Respiration Rate */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-sky-600" />
                    <span>Respiration Rate</span>
                  </span>
                  <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-mono font-bold">
                    12-20 bpm
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-outfit text-slate-900">{vitals.respirationRate}</span>
                  <span className="text-xs font-bold text-slate-400">breaths/min</span>
                </div>
                <div className="text-[11px] text-slate-500">Unlabored spontaneous rhythm</div>
              </div>
            </div>

            {/* Simulated Live ECG Waveform Canvas Visualizer */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300">
                    Lead II Telemetry Waveform Trace (125 mm/s)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Patient: {selectedDevice.patientName} • Device: {selectedDevice.deviceName}
                </span>
              </div>

              {/* Animated ECG Pulse SVG Line */}
              <div className="relative h-28 bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800 flex items-center">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 100">
                  <path
                    d="M 0 50 L 50 50 L 60 50 L 70 30 L 80 75 L 90 10 L 100 80 L 110 50 L 140 50 L 170 50 L 200 50 L 210 30 L 220 75 L 230 10 L 240 80 L 250 50 L 280 50 L 310 50 L 340 50 L 350 30 L 360 75 L 370 10 L 380 80 L 390 50 L 420 50 L 450 50 L 480 50 L 490 30 L 500 75 L 510 10 L 520 80 L 530 50 L 560 50 L 600 50"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Glowing Lead Marker */}
                <div className="absolute right-4 top-3 px-2 py-0.5 rounded bg-blue-900/60 border border-blue-500/40 text-[10px] font-mono text-blue-300">
                  ST-Segment Normal (0.08mV)
                </div>
              </div>
            </div>

            {/* Historical Telemetry Time-Series Log */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 font-outfit text-sm">
                  Historical Telemetry Logs (Past 6 Hours)
                </h3>
                <span className="text-xs text-slate-400 font-mono">1-Hour Intervals</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Logged Time</th>
                      <th className="p-3">Heart Rate</th>
                      <th className="p-3">SpO2 Oxygen</th>
                      <th className="p-3">Blood Pressure</th>
                      <th className="p-3">Blood Glucose</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {telemetry.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800 font-sans">{t.timestamp}</td>
                        <td className="p-3 font-bold text-blue-700">{t.heartRate} bpm</td>
                        <td className="p-3 text-slate-700">{t.spO2}%</td>
                        <td className="p-3 text-slate-700">{t.bpSys}/{t.bpDia} mmHg</td>
                        <td className="p-3 text-slate-700">{t.bloodGlucose} mg/dL</td>
                        <td className="p-3 text-right">
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                            Normal
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Panel: IoT Alerts & Escalation (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-800 font-outfit text-sm">
                    Telemetry Threshold Alerts
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {alerts.length} Active
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  All biometric thresholds operating within normal limits.
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{alt.vitalType}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          {alt.severity}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Observed value: <strong className="text-blue-900">{alt.value}</strong> ({alt.threshold})
                      </div>
                      <div className="text-[11px] text-slate-500 italic">
                        {alt.actionTaken}
                      </div>
                      <div className="pt-2 border-t border-blue-200 flex justify-end">
                        <button
                          onClick={() => alert(`Escalated case for ${alt.patientName} directly to ER triage bay.`)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-[11px] transition shadow-2xs"
                        >
                          Escalate to ER Triage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Threshold Configuration Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Configured Safety Thresholds
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span>Heart Rate Upper Limit</span>
                  <span className="font-mono font-bold text-slate-800">110 BPM</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span>Heart Rate Lower Limit</span>
                  <span className="font-mono font-bold text-slate-800">50 BPM</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span>Minimum SpO2 Oxygen</span>
                  <span className="font-mono font-bold text-slate-800">94%</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span>Systolic BP Cutoff</span>
                  <span className="font-mono font-bold text-slate-800">140 mmHg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Watch className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-700">No IoT Device Selected</h4>
          <p className="text-xs text-slate-400 mt-1 mb-4">Pair or select a device above to view live continuous vitals.</p>
          <button
            onClick={() => setIsPairModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
          >
            Pair New Wearable
          </button>
        </div>
      )}

      {/* Modal: Pair Wearable IoT Device */}
      {isPairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <Watch className="w-5 h-5 text-blue-600" />
              <span>Pair Wearable Medical Device</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Connect patient smartwatch, continuous glucose patch, or biosensor ring.
            </p>

            <form onSubmit={handlePairDevice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Device Name / Label</label>
                <input
                  type="text"
                  value={pairForm.deviceName}
                  onChange={(e) => setPairForm({ ...pairForm, deviceName: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Device Hardware Model</label>
                <select
                  value={pairForm.model}
                  onChange={(e) => setPairForm({ ...pairForm, model: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="Apple Watch Series 9 (Cellular)">Apple Watch Series 9 (Cellular ECG)</option>
                  <option value="BioBeat BioPatch Pro-4 Continuous">BioBeat BioPatch Pro-4 Continuous</option>
                  <option value="Dexcom G7 Continuous Glucose Monitor">Dexcom G7 Continuous Glucose Monitor</option>
                  <option value="Withings ScanWatch 2 Medical Smartwatch">Withings ScanWatch 2 Medical Smartwatch</option>
                  <option value="Oura Ring Horizon Biosensor">Oura Ring Horizon Biosensor</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Device Type</label>
                  <input
                    type="text"
                    value={pairForm.type}
                    onChange={(e) => setPairForm({ ...pairForm, type: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wireless Protocol</label>
                  <input
                    type="text"
                    value={pairForm.connectionType}
                    onChange={(e) => setPairForm({ ...pairForm, connectionType: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPairModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pairing}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  {pairing ? 'Pairing via BLE...' : 'Complete Pairing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
