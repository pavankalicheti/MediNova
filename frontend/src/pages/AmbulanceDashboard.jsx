import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import { Truck, MapPin, Navigation, Phone, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function AmbulanceDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [requestForm, setRequestForm] = useState({
    pickupLocation: '742 Evergreen Terrace, Sector 4',
    latitude: 40.7306,
    longitude: -73.9352,
    notes: 'Severe respiratory difficulty, immediate emergency transport required'
  });

  const fetchData = async () => {
    try {
      const res = await api.getAmbulances();
      setRequests(res.requests || []);
      setDrivers(res.drivers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh interval every 10 seconds for live simulation feedback
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.requestAmbulance(requestForm);
      fetchData();
      alert('Ambulance dispatched! Vehicle assigned and en route.');
    } catch (err) {
      alert('Error requesting ambulance: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status, currentProgress) => {
    let newProgress = currentProgress;
    if (status === 'Assigned') newProgress = 20;
    if (status === 'En route') newProgress = 60;
    if (status === 'Arrived') newProgress = 90;
    if (status === 'Completed') newProgress = 100;

    try {
      await api.updateAmbulanceStatus(id, status, newProgress);
      fetchData();
    } catch (err) {
      alert('Error updating ambulance status: ' + err.message);
    }
  };

  const activeTrip = requests.find(r => r.status !== 'Completed' && r.status !== 'Cancelled') || requests[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Emergency Fleet & Live Telemetry (Phase B)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 font-outfit">Ambulance Request & Live GPS Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch nearest emergency vehicles and track real-time simulated telemetry via Leaflet + OpenStreetMap.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          Refresh Fleet Status
        </button>
      </div>

      {/* Live Map Display Section */}
      {activeTrip && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-outfit flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600 animate-pulse" />
                Active Ambulance Live Map Simulation
              </h2>
              <p className="text-xs text-slate-500">
                Tracking Vehicle <strong className="text-slate-800 font-mono">{activeTrip.vehicleNumber}</strong> (Driver: {activeTrip.driverName})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-bold">
                Trip Status: {activeTrip.status} ({activeTrip.progress}% Route Progress)
              </span>
            </div>
          </div>

          <MapView
            patientLat={activeTrip.latitude}
            patientLng={activeTrip.longitude}
            driverName={activeTrip.driverName}
            vehicleNumber={activeTrip.vehicleNumber}
            status={activeTrip.status}
            progress={activeTrip.progress}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Request Ambulance Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 font-outfit mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Dispatch New Ambulance
          </h2>

          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pickup Address / Location</label>
              <input
                type="text"
                required
                value={requestForm.pickupLocation}
                onChange={(e) => setRequestForm({ ...requestForm, pickupLocation: e.target.value })}
                placeholder="Street address or landmark..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Latitude Coordinate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={requestForm.latitude}
                  onChange={(e) => setRequestForm({ ...requestForm, latitude: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Longitude Coordinate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={requestForm.longitude}
                  onChange={(e) => setRequestForm({ ...requestForm, longitude: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Dispatch Notes / Emergency Details</label>
              <textarea
                rows="2"
                value={requestForm.notes}
                onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                placeholder="Patient condition, landmark guidance..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? 'Searching Fleet...' : 'Request Immediate Emergency Ambulance'}
            </button>
          </form>
        </div>

        {/* Requests & Driver Trip Manager */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 font-outfit flex items-center justify-between">
            <span>Ambulance Dispatch Logs ({requests.length})</span>
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading ambulance requests...</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No active dispatch requests.</div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {requests.map((req) => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-800 font-outfit">{req.patientName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{req.pickupLocation}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {req.status} ({req.progress}%)
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-100 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>Vehicle: <strong className="text-slate-800 font-mono">{req.vehicleNumber}</strong></span>
                    <span>Driver: <strong className="text-slate-800">{req.driverName}</strong></span>
                    <span>Phone: <strong className="text-blue-600 font-mono">{req.contact}</strong></span>
                  </div>

                  {/* Trip Control Buttons for Driver / Admin */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">Update Status:</span>
                    <button
                      onClick={() => handleStatusUpdate(req.id, 'Assigned', 20)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px]"
                    >
                      Assigned
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(req.id, 'En route', 60)}
                      className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded text-[10px]"
                    >
                      En route
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(req.id, 'Arrived', 90)}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded text-[10px]"
                    >
                      Arrived
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(req.id, 'Completed', 100)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded text-[10px] font-bold"
                    >
                      Completed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
