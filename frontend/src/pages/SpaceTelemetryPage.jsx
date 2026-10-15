import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Radio,
  Activity,
  Globe2,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  Heart,
  Zap,
  Gauge,
  User,
  Wifi,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function SpaceTelemetryPage() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState([]);
  const [crew, setCrew] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState('space_node_lunar_gateway');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [pinging, setPinging] = useState(false);

  // Habitat Life Support Environmental Controls
  const [lifeSupportForm, setLifeSupportForm] = useState({
    oxygenPercent: 21.2,
    cabinPressureKPa: 101.3
  });
  const [savingLifeSupport, setSavingLifeSupport] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [nodesRes, crewRes] = await Promise.all([
        api.getSpaceNodes(),
        api.getSpaceCrewVitals()
      ]);
      const nodeList = nodesRes.nodes || [];
      setNodes(nodeList);
      setCrew(crewRes.crew || []);
      if (nodeList.length > 0) {
        setSelectedNodeId(nodeList[0].id);
        setLifeSupportForm({
          oxygenPercent: nodeList[0].lifeSupportOxygenLevelPercent || 21.2,
          cabinPressureKPa: nodeList[0].cabinPressureKPa || 101.3
        });
      }
    } catch (err) {
      console.error('Failed to load space telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePing = async () => {
    try {
      setPinging(true);
      const res = await api.pingSpaceTelemetry(selectedNodeId);
      setNotification(`DTN telemetry handshake confirmed (${res.lightDistanceSeconds}s light-distance). Round-trip sync: ${res.roundTripLatency}s.`);
      setTimeout(() => setNotification(''), 5000);
    } catch (err) {
      console.error('Ping error:', err);
    } finally {
      setPinging(false);
    }
  };

  const handleSaveLifeSupport = async (e) => {
    e.preventDefault();
    try {
      setSavingLifeSupport(true);
      const res = await api.adjustSpaceLifeSupport({
        nodeId: selectedNodeId,
        ...lifeSupportForm
      });
      setNotification(res.message || 'Habitat environmental life support adjusted and verified.');
      setTimeout(() => setNotification(''), 5000);
      loadData();
    } catch (err) {
      console.error('Save life support error:', err);
    } finally {
      setSavingLifeSupport(false);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0] || null;

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
              <span>Interplanetary DTN Telemetry</span>
            </span>
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-medium rounded-md">
              CCSDS Delay-Tolerant Protocol RFC 5050
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Deep-Space Medical Telemetry Relay</h1>
          <p className="text-sm text-slate-500 mt-1">
            Orbital astronaut vitals tracking, radiation dosimetry, microgravity cardiovascular monitoring, and autonomous life support.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition"
            title="Refresh Space Telemetry"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={handlePing}
            disabled={pinging}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition"
          >
            <Wifi className={`w-4 h-4 ${pinging ? 'animate-pulse' : ''}`} />
            <span>{pinging ? 'Transmitting DTN Bundle...' : 'Ping Delay-Tolerant Relay'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Light-Time Latency</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{selectedNode ? selectedNode.lightDistanceSeconds : '1.28'} s</span>
            <div className="text-xs text-blue-600 mt-1 font-medium">
              Earth-Gateway propagation delay
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Signal Quality</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Radio className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-blue-600">{selectedNode ? selectedNode.telemetrySignalQualityPercent : '99.1'}%</span>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Ka-band optical relay link
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hab Oxygen (O₂)</span>
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Gauge className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{selectedNode ? selectedNode.lifeSupportOxygenLevelPercent : '21.2'}%</span>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Nominal breathable atmosphere
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Radiation Dosimetry</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{selectedNode ? selectedNode.radiationDosimetryMilliSievertsPerDay : '1.42'} mSv/d</span>
            <div className="text-xs text-blue-600 mt-1 font-medium">
              Active lunar orbit dosimeter
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Orbital Relay Nodes & Habitat Life Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Relay Node Selector & Telemetry Stream */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Orbital Stations & Deep Space Relays</h2>
              <p className="text-xs text-slate-500">Delay-Tolerant Networking telemetry nodes maintaining crew biometrics.</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
              {nodes.length} Nodes Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  setLifeSupportForm({
                    oxygenPercent: node.lifeSupportOxygenLevelPercent || 21.2,
                    cabinPressureKPa: node.cabinPressureKPa || 101.3
                  });
                }}
                className={`border rounded-xl p-4.5 cursor-pointer transition ${
                  selectedNodeId === node.id
                    ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {node.orbitType}
                    </span>
                    <h3 className="font-bold text-slate-900 mt-1 text-sm">{node.missionName}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{node.id}</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" title="Connected"></span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Light Distance Delay:</span>
                    <span className="font-mono font-bold text-blue-700">{node.lightDistanceSeconds}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">DTN Protocol:</span>
                    <span className="font-medium text-slate-800">{node.dtnProtocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cabin Pressure:</span>
                    <span className="font-semibold text-slate-800">{node.cabinPressureKPa} kPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AI Diagnostic Node:</span>
                    <span className="font-bold text-blue-600">{node.autonomousTriageSystemStatus}</span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Flight Doctor: <strong className="text-slate-700">{node.stationDoctor}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habitat Life Support Environmental Tuning */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 mb-1">
              <Sliders className="w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-900">Habitat Atmosphere Control</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ground tele-support override for habitat atmospheric levels and radiation shielding barriers.
            </p>

            <form onSubmit={handleSaveLifeSupport} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Target Oxygen Level (O₂)</span>
                  <span className="font-mono text-blue-600">{lifeSupportForm.oxygenPercent}%</span>
                </div>
                <input
                  type="range"
                  min="19.0"
                  max="23.0"
                  step="0.1"
                  value={lifeSupportForm.oxygenPercent}
                  onChange={(e) => setLifeSupportForm({ ...lifeSupportForm, oxygenPercent: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Cabin Barometric Pressure</span>
                  <span className="font-mono text-blue-600">{lifeSupportForm.cabinPressureKPa} kPa</span>
                </div>
                <input
                  type="range"
                  min="95.0"
                  max="103.0"
                  step="0.2"
                  value={lifeSupportForm.cabinPressureKPa}
                  onChange={(e) => setLifeSupportForm({ ...lifeSupportForm, cabinPressureKPa: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-blue-900">Station Environmental Telemetry:</div>
                <p className="text-[11px] text-slate-600">
                  Selected Hub: <strong>{selectedNode ? selectedNode.missionName : 'Deep Space Hab'}</strong>
                </p>
                <p className="text-[11px] text-slate-600">
                  Radiation Dosimeter: <strong>{selectedNode ? selectedNode.radiationDosimetryMilliSievertsPerDay : 1.42} mSv/day (Safe Level)</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={savingLifeSupport}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
              >
                {savingLifeSupport ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uplinking Telemetry Command...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Uplink Environmental Adjustments</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center space-x-1">
            <Globe2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span>Deep space bundles protected by AES-256-GCM delay encryption.</span>
          </div>
        </div>
      </div>

      {/* Crew Health & Biometric Status Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Orbital Crew Biometric Roster</h2>
          <p className="text-xs text-slate-500">Live continuous biosensor streams monitoring microgravity cardiovascular and bone adaptation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crew.map((member) => (
            <div key={member.id} className="border border-slate-200 hover:border-blue-300 rounded-xl p-4.5 transition bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {member.mission}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{member.callsign}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{member.role}</p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{member.microgravityCardioStatus}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Heart Rate</span>
                  <span className="text-base font-bold text-slate-900">{member.heartRateBpm} <span className="text-[10px] text-slate-500 font-normal">BPM</span></span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Blood Pressure</span>
                  <span className="text-base font-bold text-slate-900">{member.bloodPressureSys}/{member.bloodPressureDia}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">SpO₂ Oxygen</span>
                  <span className="text-base font-bold text-blue-600">{member.spO2Percent}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mt-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Cum. Radiation</span>
                  <span className="text-xs font-bold text-slate-800">{member.radiationDoseTotalMsv} mSv</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Bone Density</span>
                  <span className="text-xs font-bold text-slate-800">{member.boneMineralDensityDelta}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-semibold">Cognitive Score</span>
                  <span className="text-xs font-bold text-blue-600">{member.cognitiveAcuityScore}/100</span>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Hydration: <strong className="text-slate-800">{member.hydrationPercent}%</strong></span>
                <span className="text-[11px] text-slate-400 font-mono">Last Sync: Live Telemetry Stream</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
