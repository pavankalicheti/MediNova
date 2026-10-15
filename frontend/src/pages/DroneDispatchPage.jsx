import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Send,
  Navigation,
  Compass,
  BatteryCharging,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Play,
  RotateCcw,
  Wind,
  MapPin,
  Clock,
  Layers,
  Droplet
} from 'lucide-react';

export default function DroneDispatchPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet', 'missions', 'corridors'
  const [fleet, setFleet] = useState([]);
  const [missions, setMissions] = useState([]);
  const [corridors, setCorridors] = useState([]);
  const [selectedDroneId, setSelectedDroneId] = useState('drn_01');
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  // Dispatch Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    droneId: 'drn_01',
    destinationFacility: 'Saint Jude Regional Trauma & Surgery Center',
    payload: '4x Units O-Negative PRBC (Universal Donor) + 2x Platelets',
    priority: 'STAT Life-Threatening Triage',
    corridorId: 'corr_alpha'
  });
  const [dispatching, setDispatching] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fleetRes, missRes, corrRes] = await Promise.all([
        api.getDroneFleet(),
        api.getDroneMissions(),
        api.getDroneCorridors()
      ]);

      setFleet(fleetRes.fleet || []);
      setMissions(missRes.missions || []);
      setCorridors(corrRes.corridors || []);
    } catch (err) {
      console.error('Failed to load drone dispatch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedDrone = fleet.find(d => d.id === selectedDroneId) || fleet[0] || null;

  // Launch New Mission
  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    try {
      setDispatching(true);
      const res = await api.dispatchDroneMission(dispatchForm);
      setActionNotice(res.message);
      setIsDispatchModalOpen(false);
      await loadData();
      setTimeout(() => setActionNotice(''), 6000);
    } catch (err) {
      alert('Failed to dispatch drone: ' + err.message);
    } finally {
      setDispatching(false);
    }
  };

  // Return to Home (RTH)
  const handleRTH = async () => {
    if (!selectedDrone) return;
    try {
      const res = await api.commandDroneRTH(selectedDrone.id);
      setActionNotice(res.message);
      await loadData();
      setTimeout(() => setActionNotice(''), 6000);
    } catch (err) {
      alert('Failed to command RTH: ' + err.message);
    }
  };

  // Temperature Compliance Verification
  const handleTempCheck = async () => {
    if (!selectedDrone) return;
    try {
      const res = await api.checkDronePayloadTemp(selectedDrone.id);
      setActionNotice(
        `Cryo-Telemetry Verified: ${selectedDrone.callsign} payload bay at ${res.currentTemperatureC}°C (Target: ${res.targetRange}). Compliant with clinical standards.`
      );
      await loadData();
      setTimeout(() => setActionNotice(''), 6000);
    } catch (err) {
      alert('Failed to check temperature: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-600">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Connecting to Autonomous eVTOL Medical Drone Fleet...
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
              <Navigation className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-outfit">
                Autonomous Drone Blood &amp; Specimen Dispatch
              </h1>
              <p className="text-xs text-slate-500">
                BVLOS (Beyond Visual Line of Sight) autonomous eVTOL medical logistics for emergency blood products, rare platelets, and STAT biospecimens.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Temperature Verification Button */}
          <button
            onClick={handleTempCheck}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Thermometer className="w-3.5 h-3.5 text-blue-600" />
            <span>Verify Cold-Chain (2-6°C)</span>
          </button>

          {/* RTH Button */}
          <button
            onClick={handleRTH}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Emergency RTH Command</span>
          </button>

          {/* Launch Drone Button */}
          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Launch Drone Mission</span>
          </button>
        </div>
      </div>

      {/* Fleet Drone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fleet.map((drone) => {
          const isSelected = drone.id === selectedDroneId;
          const isFlight = drone.status.includes('In-Flight');

          return (
            <button
              key={drone.id}
              onClick={() => setSelectedDroneId(drone.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-400 shadow-sm ring-1 ring-blue-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {drone.id.toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isFlight
                    ? 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {isFlight ? '● Airborne Mission' : drone.status}
                </span>
              </div>

              <div className="font-bold text-slate-800 text-sm font-outfit truncate">
                {drone.callsign}
              </div>

              <div className="text-xs text-slate-500 mt-1 truncate">
                Payload: <strong className="text-slate-700">{drone.payloadType}</strong>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Speed</span>
                  <span className="text-slate-800 font-bold">{drone.cruisingSpeedKmh} km/h</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Altitude</span>
                  <span className="text-slate-800 font-bold">{drone.altitudeMeters}m</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Battery</span>
                  <span className="text-blue-700 font-bold">{drone.batteryPercent}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Drone Avionics Detail Banner */}
      {selectedDrone && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Destination Facility</span>
              <div className="font-bold text-slate-800 text-xs truncate">
                {selectedDrone.destination}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Distance &amp; ETA</span>
              <div className="font-mono font-bold text-blue-700 text-xs">
                {selectedDrone.distanceRemainingKm} km • {selectedDrone.etaMinutes} min ETA
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Active Cryo-Chamber</span>
              <div className="font-bold text-slate-800 text-xs font-mono">
                {selectedDrone.payloadBayTempC}°C (Target: 2-6°C)
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Assigned Air Corridor</span>
              <div className="font-semibold text-slate-700 text-xs truncate">
                {selectedDrone.flightCorridor}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Emergency Priority</span>
              <div className="font-bold text-blue-900 text-xs">
                {selectedDrone.emergencyPriority}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('fleet')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'fleet'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Flight Telemetry &amp; Waypoint Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'missions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>Blood Dispatch Missions ({missions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('corridors')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'corridors'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Approved Air Corridors ({corridors.length})</span>
        </button>
      </div>

      {/* TAB 1: FLIGHT TELEMETRY & WAYPOINT RADAR */}
      {activeTab === 'fleet' && selectedDrone && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Airborne Mission Progress Card (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 font-outfit text-base">
                    Live Autonomous Waypoint Tracking: {selectedDrone.callsign}
                  </h3>
                  <p className="text-xs text-slate-500">
                    BVLOS automated trajectory managed by precision RTK-GPS and collision avoidance lidar.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                  RTK-GPS Fixed
                </span>
              </div>

              {/* Waypoint Visualizer Bar */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span><strong>Origin:</strong> {selectedDrone.origin}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span><strong>Target:</strong> {selectedDrone.destination}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${selectedDrone.status.includes('In-Flight') ? 65 : 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Speed: <strong className="text-slate-800">{selectedDrone.cruisingSpeedKmh} km/h</strong></span>
                  <span>Altitude: <strong className="text-slate-800">{selectedDrone.altitudeMeters}m AGL</strong></span>
                  <span>Distance Left: <strong className="text-blue-700">{selectedDrone.distanceRemainingKm} km</strong></span>
                </div>
              </div>

              {/* Avionics Diagnostics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Avionics System</span>
                  <div className="text-xs font-bold text-slate-800">Triple-Redundant IMU</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Data Telemetry</span>
                  <div className="text-xs font-bold text-blue-700">Dual 5G + Satellite Link</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Emergency Chute</span>
                  <div className="text-xs font-bold text-slate-800">Ballistic Pyrotechnic Safe</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Cold-Chain Status</span>
                  <div className="text-xs font-bold text-blue-900">2-6°C Compliant</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Airspace & Payload Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                Active Payload Cold-Chain Seal
              </span>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">Cryo-Pod Temperature</span>
                  <span className="font-mono font-bold text-blue-700">{selectedDrone.payloadBayTempC}°C</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Continuous multi-sensor thermometry satisfies FDA 21 CFR biological specimen transit specifications.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500">Payload:</span>
                  <span className="font-bold text-slate-800 truncate" title={selectedDrone.payloadType}>
                    {selectedDrone.payloadType}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500">Priority:</span>
                  <span className="font-bold text-blue-900">{selectedDrone.emergencyPriority}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MISSIONS LEDGER */}
      {activeTab === 'missions' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 font-outfit text-sm">
              Autonomous Drone Medical Sorties &amp; Chain-of-Custody
            </h3>
            <span className="text-xs text-slate-500">{missions.length} Missions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {missions.map((msn) => (
              <div key={msn.id} className="p-5 hover:bg-slate-50 transition space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700">{msn.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-800">{msn.droneCallsign}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                      {msn.flightStatus}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-800">
                    {msn.priority}
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <strong>Blood Payload:</strong> {msn.payload}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>Origin: <strong>{msn.originHub}</strong></span>
                  <span>Destination: <strong>{msn.destinationFacility}</strong></span>
                  <span>Cold-Chain: <strong className="text-blue-700">{msn.coldChainStatus}</strong></span>
                  <span>Dispatched by: <strong>{msn.dispatchedBy}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: APPROVED CORRIDORS */}
      {activeTab === 'corridors' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 font-outfit text-base">
                Designated Medical Air Corridors (BVLOS Authorized)
              </h3>
              <p className="text-xs text-slate-500">
                Pre-cleared low-risk aerial pathways reserved exclusively for life-saving blood logistics and organ transit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {corridors.map((corr) => (
                <div key={corr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-outfit text-slate-800">{corr.name}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                      {corr.id.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Ceiling: <strong className="font-mono">{corr.altitudeCeilingMeters}m</strong></div>
                    <div>Max Airspeed: <strong className="font-mono">{corr.maxSpeedKmh} km/h</strong></div>
                    <div className="text-blue-700 font-semibold">{corr.status}</div>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-200">
                    {corr.airspaceAuth}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH DRONE MISSION */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <span>Launch Autonomous Blood Drone Mission</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatch rapid emergency blood product shipment via authorized eVTOL medical air transit.
            </p>

            <form onSubmit={handleDispatchSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Drone Unit</label>
                <select
                  value={dispatchForm.droneId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, droneId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  {fleet.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.callsign} ({d.status}) - Batt: {d.batteryPercent}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Facility</label>
                <select
                  value={dispatchForm.destinationFacility}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, destinationFacility: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="Saint Jude Regional Trauma &amp; Surgery Center">Saint Jude Regional Trauma &amp; Surgery Center</option>
                  <option value="Metro General University Hospital">Metro General University Hospital</option>
                  <option value="Hopkins Affiliate Specialized Cardiac Center">Hopkins Affiliate Specialized Cardiac Center</option>
                  <option value="South Valley Rural Emergency Clinic">South Valley Rural Emergency Clinic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Payload Specification</label>
                <input
                  type="text"
                  value={dispatchForm.payload}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, payload: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Priority Level</label>
                <select
                  value={dispatchForm.priority}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, priority: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="STAT Life-Threatening Triage">STAT Life-Threatening Triage (Emergency Priority)</option>
                  <option value="Urgent Surgical Resupply">Urgent Surgical Resupply</option>
                  <option value="Scheduled Inter-Hospital Transfer">Scheduled Inter-Hospital Transfer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  {dispatching ? 'Launching...' : 'Authorize Autonomous Sortie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
