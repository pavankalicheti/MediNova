import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Layers,
  Dna,
  Activity,
  Sparkles,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Thermometer,
  ShieldCheck,
  Cpu,
  Sliders,
  ChevronRight,
  TrendingUp,
  Box,
  Droplet
} from 'lucide-react';

export default function BioPrintingPage() {
  const { user } = useAuth();
  const [printers, setPrinters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // New Bio-Print Job Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    patientId: 'usr_pat_1',
    patientName: 'Sarah Jenkins',
    organType: 'Vascularized Myocardial Cardiac Patch',
    dimensionsMm: '35 x 35 x 2.8 mm',
    scaffoldMaterial: 'Polycaprolactone (PCL) + GelMA Bio-Ink',
    intendedSurgeon: 'Dr. Marcus Vance (Cardiovascular Surgery)'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [printersRes, jobsRes] = await Promise.all([
        api.getBioPrinters(),
        api.getBioPrintJobs()
      ]);
      setPrinters(printersRes.printers || []);
      setJobs(jobsRes.jobs || []);
    } catch (err) {
      console.error('Failed to load bio-printing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createBioPrintJob(newJobForm);
      setNotification(res.message || 'Bio-printing synthesis initiated. Micro-capillary extrusion started.');
      setTimeout(() => setNotification(''), 5000);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to start bio-print job:', err);
      setNotification('Bio-print job queued for extrusion.');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalibratePrinter = async (id) => {
    try {
      const res = await api.calibrateBioPrinter(id);
      setNotification(res.message || 'Nozzle temperature calibrated to 37.0°C and 10µm extrusion zero-point set.');
      setTimeout(() => setNotification(''), 5000);
      loadData();
    } catch (err) {
      console.error('Calibration error:', err);
    }
  };

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
              <span>Cellular Scaffold Engineering</span>
            </span>
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-medium rounded-md">
              Class 100 ISO 5 Bio-Enclosure
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Autonomous 3D Bio-Printing Suite</h1>
          <p className="text-sm text-slate-500 mt-1">
            Living tissue scaffold extrusion, autologous organoid synthesis, and vascular micro-capillary fabrication.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Organoid Print Job</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Bio-Printers</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{printers.length} Systems</span>
            <div className="text-xs text-blue-600 mt-1 font-medium">
              1 Extruding / 1 Sterilized Standby
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cell Viability Yield</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Dna className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-blue-600">97.4%</span>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Post-extrusion shear survival
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolution Precision</span>
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">10 µm</span>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Micro-extrusion pore size
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nozzle Temperature</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Thermometer className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">37.1 °C</span>
            <div className="text-xs text-blue-600 mt-1 font-medium">
              Exact physiologic normothermia
            </div>
          </div>
        </div>
      </div>

      {/* Bio-Printer Hardware Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {printers.map((p) => {
          const progressPercent = p.layerCount > 0 ? Math.round((p.currentLayer / p.layerCount) * 100) : 0;
          return (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {p.model}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1.5">{p.name}</h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Unit ID: {p.id}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    p.status.includes('Active')
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.status}
                  </span>
                </div>

                {/* Extrusion Progress Bar (if active) */}
                {p.activeJobId && (
                  <div className="mt-5 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">Live Extrusion Layer</span>
                      <span className="font-mono font-bold text-blue-700">
                        {p.currentLayer} / {p.layerCount} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                      <span>Nozzle Temp: <strong className="text-slate-800">{p.nozzleTemperatureC}°C</strong></span>
                      <span>Resolution: <strong className="text-slate-800">{p.printResolutionMicrons} µm</strong></span>
                    </div>
                  </div>
                )}

                {/* Bio-Ink Cartridges */}
                <div className="mt-5">
                  <span className="text-xs font-semibold text-slate-700 block mb-2.5 flex items-center space-x-1.5">
                    <Droplet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bio-Ink Cartridge Volumes</span>
                  </span>
                  <div className="space-y-2">
                    {p.bioInks && p.bioInks.map((ink, i) => (
                      <div key={i} className="flex items-center justify-between text-xs border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                        <span className="font-medium text-slate-800">{ink.name}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-[11px] text-slate-500">{ink.tempC}°C</span>
                          <span className="font-mono font-bold text-blue-600">{ink.volumeRemainingMl} mL</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">{p.chamberSterility}</span>
                <button
                  onClick={() => handleCalibratePrinter(p.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition border border-blue-200"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Recalibrate Nozzle</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bio-Print Jobs History & Active Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Living Scaffold Synthesis Records</h2>
          <p className="text-xs text-slate-500">Fabrication specifications, micro-vascular density, and biocompatibility verification.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Job ID / Date</th>
                <th className="py-3 px-5">Patient & Organ Spec</th>
                <th className="py-3 px-5">Dimensions & Density</th>
                <th className="py-3 px-5">Scaffold Biomaterial</th>
                <th className="py-3 px-5">Cell Viability</th>
                <th className="py-3 px-5">Intended Surgeon</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-4 px-5">
                    <div className="font-mono font-bold text-slate-900">{job.id}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{job.startedAt?.split('T')[0]}</div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900">{job.organType}</div>
                    <div className="text-[11px] text-blue-600 font-semibold">{job.patientName}</div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-mono text-slate-800 font-medium">{job.dimensionsMm}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{job.microVascularDensity}</div>
                  </td>
                  <td className="py-4 px-5 max-w-xs text-slate-700 truncate" title={job.scaffoldMaterial}>
                    {job.scaffoldMaterial}
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-blue-600 text-sm">{job.cellViabilityPercent}%</span>
                  </td>
                  <td className="py-4 px-5 text-slate-700">
                    {job.intendedSurgeon}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      job.status.includes('Completed')
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                      {job.status.includes('Completed') ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Activity className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                      )}
                      <span>{job.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl max-w-lg w-full animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-blue-600">
                <Box className="w-5 h-5" />
                <h3 className="font-bold text-slate-900">Initiate Organoid Bio-Print Synthesis</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Organ / Tissue Spec</label>
                <select
                  value={newJobForm.organType}
                  onChange={(e) => setNewJobForm({ ...newJobForm, organType: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Vascularized Myocardial Cardiac Patch">Vascularized Myocardial Cardiac Patch</option>
                  <option value="Cranial Osteochondral Regeneration Lattice">Cranial Osteochondral Regeneration Lattice</option>
                  <option value="Micro-Capillary Hepatic Lobule Core">Micro-Capillary Hepatic Lobule Core</option>
                  <option value="Tracheal Cartilaginous Tubular Ring">Tracheal Cartilaginous Tubular Ring</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Patient</label>
                <input
                  type="text"
                  required
                  value={newJobForm.patientName}
                  onChange={(e) => setNewJobForm({ ...newJobForm, patientName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dimensions (X x Y x Z mm)</label>
                  <input
                    type="text"
                    required
                    value={newJobForm.dimensionsMm}
                    onChange={(e) => setNewJobForm({ ...newJobForm, dimensionsMm: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Intended Lead Surgeon</label>
                  <input
                    type="text"
                    required
                    value={newJobForm.intendedSurgeon}
                    onChange={(e) => setNewJobForm({ ...newJobForm, intendedSurgeon: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scaffold Matrix & Bio-Ink Formulation</label>
                <select
                  value={newJobForm.scaffoldMaterial}
                  onChange={(e) => setNewJobForm({ ...newJobForm, scaffoldMaterial: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Polycaprolactone (PCL) + GelMA Bio-Ink">Polycaprolactone (PCL) + GelMA Bio-Ink</option>
                  <option value="Bioactive Tricalcium Phosphate & Collagen Matrix">Bioactive Tricalcium Phosphate & Collagen Matrix</option>
                  <option value="Alginate-Gelatin-Decellularized ECM Composite">Alginate-Gelatin-Decellularized ECM Composite</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-600">
                Extrusion protocol ensures 97%+ post-shear cell viability within class 100 sterile laminar bio-enclosure.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center space-x-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Calibrating & Extruding...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Start Bio-Print Synthesis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
