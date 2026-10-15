import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Scan,
  FileImage,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ShieldCheck,
  Maximize2,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

export default function MedicalImagingPage() {
  const { user } = useAuth();
  const [studies, setStudies] = useState([]);
  const [selectedStudyId, setSelectedStudyId] = useState('img_std_01');
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [patients, setPatients] = useState([]);

  // New Analysis Form
  const [analyzeForm, setAnalyzeForm] = useState({
    patientId: 'usr_pat_1',
    modality: 'Chest Radiograph (Digital X-Ray PA/Lateral)',
    bodyPart: 'Thorax / Pulmonary',
    clinicalNotes: 'Suspected respiratory infection, persistent cough and fever'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [studiesRes, patRes] = await Promise.all([
        api.getImagingStudies(),
        api.getAllPatients()
      ]);

      const list = studiesRes.studies || [];
      setStudies(list);
      setPatients(patRes.patients || []);

      const active = list.find(s => s.id === selectedStudyId) || list[0] || null;
      setSelectedStudy(active);
      if (active) setSelectedStudyId(active.id);
    } catch (err) {
      console.error('Failed to load imaging studies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectStudy = (id) => {
    setSelectedStudyId(id);
    const found = studies.find(s => s.id === id);
    if (found) setSelectedStudy(found);
  };

  const handleAnalyzeSubmit = async (e) => {
    e.preventDefault();
    try {
      setAnalyzing(true);
      const res = await api.analyzeMedicalImage(analyzeForm);
      setNotification(res.message);
      setIsAnalyzeModalOpen(false);
      await loadData();
      setSelectedStudyId(res.study.id);
      setSelectedStudy(res.study);
      setTimeout(() => setNotification(''), 6000);
    } catch (err) {
      alert('Failed to analyze image: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSignOff = async () => {
    if (!selectedStudy) return;
    try {
      const res = await api.reviewImagingStudy(selectedStudy.id, {
        status: 'Verified & Signed by Attending Radiologist'
      });
      setSelectedStudy(res.study);
      setNotification('Radiological impression officially signed off and archived.');
      await loadData();
      setTimeout(() => setNotification(''), 6000);
    } catch (err) {
      alert('Failed to sign off: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-600">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Loading AI Diagnostic Image Inference Engine...
        </p>
      </div>
    );
  }

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
              <Scan className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-outfit">
                AI-Assisted Medical Image Analysis &amp; Radiology
              </h1>
              <p className="text-xs text-slate-500">
                Deep neural network anomaly detection, automated radiograph classification, and radiologist co-pilot diagnostics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAnalyzeModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload &amp; Analyze Scan</span>
          </button>
        </div>
      </div>

      {/* Studies Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {studies.map((std) => {
          const isSelected = std.id === selectedStudyId;

          return (
            <button
              key={std.id}
              onClick={() => handleSelectStudy(std.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-400 shadow-sm ring-1 ring-blue-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {std.id.toUpperCase()}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {std.confidenceScore}% AI Confidence
                </span>
              </div>

              <div className="font-bold text-slate-800 text-sm font-outfit truncate">
                {std.modality}
              </div>

              <div className="text-xs text-slate-500 mt-1">
                Patient: <strong className="text-slate-700">{std.patientName}</strong>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">{std.primaryFinding}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Viewer */}
      {selectedStudy && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulated Image Viewer Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-white">
                <span className="font-mono text-[11px] flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-blue-400" />
                  DICOM Imaging Viewport • {selectedStudy.bodyPart}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Matrix: 2048x2048 • 16-Bit Grayscale
                </span>
              </div>

              <div className="h-96 relative flex items-center justify-center p-4">
                {/* Simulated X-Ray / Radiograph Graphic */}
                <div className="w-72 h-80 bg-slate-900/90 rounded-2xl border border-slate-800 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/40 to-slate-950 opacity-80"></div>

                  <div className="relative text-center z-10 space-y-2">
                    <Scan className="w-16 h-16 text-blue-400/80 mx-auto" />
                    <div className="text-white text-xs font-mono font-bold">
                      {selectedStudy.modality}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {selectedStudy.studyDate} • {selectedStudy.patientName}
                    </div>
                  </div>

                  {/* AI Anomaly Bounding Box Highlight */}
                  {selectedStudy.anomalyBoundingBox && (
                    <div
                      className="absolute border-2 border-blue-400 bg-blue-500/10 rounded-lg animate-pulse flex items-start justify-end p-1 shadow-lg"
                      style={{
                        top: `${selectedStudy.anomalyBoundingBox.y}%`,
                        left: `${selectedStudy.anomalyBoundingBox.x}%`,
                        width: `${selectedStudy.anomalyBoundingBox.width}%`,
                        height: `${selectedStudy.anomalyBoundingBox.height}%`
                      }}
                    >
                      <span className="text-[9px] font-mono font-bold bg-blue-600 text-white px-1 py-0.2 rounded shadow">
                        {selectedStudy.confidenceScore}% Anomaly
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span>Model: <strong>{selectedStudy.aiModel}</strong></span>
                  <span className="text-blue-400 font-bold">Inference Speed: 42ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Clinical Diagnostic Findings (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 font-outfit text-base">
                  Neural Diagnostic Findings
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {selectedStudy.severity} Severity
                </span>
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
                  Primary Radiologic Finding
                </span>
                <div className="text-sm font-bold text-blue-900">
                  {selectedStudy.primaryFinding}
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700">Detailed Anatomical Observations:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedStudy.findingsSummary}
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700">Recommended Clinical Next Steps:</span>
                <p className="text-blue-800 font-medium bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  {selectedStudy.recommendedAction}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <div>Signed Off By: <strong className="text-slate-800">{selectedStudy.radiologistSignOff}</strong></div>
                <div>Status: <span className="font-semibold text-blue-700">{selectedStudy.status}</span></div>
              </div>

              <button
                onClick={handleSignOff}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm &amp; Sign Off Radiology Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload & Analyze */}
      {isAnalyzeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <Scan className="w-5 h-5 text-blue-600" />
              <span>Submit Radiological Study for AI Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload DICOM or high-resolution radiograph to trigger neural classification and anomaly segmentation.
            </p>

            <form onSubmit={handleAnalyzeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Patient</label>
                <select
                  value={analyzeForm.patientId}
                  onChange={(e) => setAnalyzeForm({ ...analyzeForm, patientId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Imaging Modality</label>
                <select
                  value={analyzeForm.modality}
                  onChange={(e) => setAnalyzeForm({ ...analyzeForm, modality: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="Chest Radiograph (Digital X-Ray PA/Lateral)">Chest Radiograph (Digital X-Ray PA/Lateral)</option>
                  <option value="Brain MRI (T1-Weighted Contrast &amp; FLAIR 3T)">Brain MRI (T1-Weighted Contrast &amp; FLAIR 3T)</option>
                  <option value="Knee Radiograph (Weight-Bearing AP/Lateral)">Knee Radiograph (Weight-Bearing AP/Lateral)</option>
                  <option value="CT Angiography Pulmonary Embolism Protocol">CT Angiography Pulmonary Embolism Protocol</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Anatomical Region</label>
                <input
                  type="text"
                  value={analyzeForm.bodyPart}
                  onChange={(e) => setAnalyzeForm({ ...analyzeForm, bodyPart: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Indication</label>
                <input
                  type="text"
                  value={analyzeForm.clinicalNotes}
                  onChange={(e) => setAnalyzeForm({ ...analyzeForm, clinicalNotes: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAnalyzeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={analyzing}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  {analyzing ? 'Inference Running...' : 'Execute AI Analysis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
