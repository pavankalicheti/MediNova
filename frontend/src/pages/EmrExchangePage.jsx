import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Share2,
  Building2,
  FileText,
  Search,
  Download,
  Upload,
  CheckCircle,
  ShieldCheck,
  Lock,
  ArrowRightLeft,
  Key,
  ExternalLink,
  Plus,
  RefreshCw,
  Send,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export default function EmrExchangePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbound'); // 'inbound', 'outbound', 'network', 'audit'

  // Data states
  const [hospitals, setHospitals] = useState([]);
  const [records, setRecords] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Dispatch Transfer Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchData, setDispatchData] = useState({
    patientId: 'usr_pat_1',
    targetHospitalId: 'hosp_stjude',
    transferReason: 'Trauma Surgery Escalation & ICU Transfer',
    notes: 'Patient vitals stabilized; complete clinical file transmitted.'
  });
  const [dispatching, setDispatching] = useState(false);

  // Notice Banner
  const [statusNotice, setStatusNotice] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [hospRes, recRes, auditRes, patRes] = await Promise.all([
        api.getNetworkHospitals(),
        api.getExchangeRecords({ search: searchQuery }),
        api.getExchangeAuditLog(),
        api.getAllPatients()
      ]);
      setHospitals(hospRes.hospitals || []);
      setRecords(recRes.records || []);
      setAuditLog(auditRes.auditLog || []);
      setPatients(patRes.patients || []);
      if (patRes.patients?.length > 0 && !dispatchData.patientId) {
        setDispatchData(prev => ({ ...prev, patientId: patRes.patients[0].id }));
      }
    } catch (err) {
      console.error('Failed to load EMR exchange data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleImportRecord = async (recordId, patientName) => {
    try {
      await api.importExternalRecord(recordId);
      setStatusNotice(`Record for ${patientName} successfully imported and reconciled into MediNova Central EMR!`);
      setTimeout(() => setStatusNotice(''), 4000);
      await loadData();
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };

  const handleDispatchDossier = async (e) => {
    e.preventDefault();
    try {
      setDispatching(true);
      const res = await api.dispatchTransferDossier(dispatchData);
      setIsDispatchModalOpen(false);
      setStatusNotice(res.message);
      setTimeout(() => setStatusNotice(''), 4500);
      await loadData();
    } catch (err) {
      alert('Dispatch failed: ' + err.message);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold font-outfit text-slate-800">Cross-Hospital EMR Exchange</h1>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              FHIR v4.0.1 Compliant
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Secure, interoperable regional health information exchange connecting partner hospital networks with cryptographic SHA-256 validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Patient Transfer Dossier</span>
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2 font-medium animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Network Health Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Certified Partner Nodes</div>
          <div className="text-2xl font-bold font-outfit text-slate-800 mt-1">{hospitals.length} Facilities</div>
          <div className="text-[11px] text-blue-600 mt-0.5 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Regional Interoperability Hub</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Inter-Hospital Records</div>
          <div className="text-2xl font-bold font-outfit text-blue-700 mt-1">4,930 Clinical Docs</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Indexed across Network</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Encryption Standard</div>
          <div className="text-2xl font-bold font-outfit text-slate-900 mt-1">TLS 1.3 mTLS</div>
          <div className="text-[11px] text-blue-600 mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Cryptographic Trust Verified</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Audit Compliance</div>
          <div className="text-2xl font-bold font-outfit text-slate-800 mt-1">{auditLog.length} Signed Logs</div>
          <div className="text-[11px] text-blue-600 mt-0.5 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable Ledger</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'inbound', label: 'Inbound Hospital Records', icon: Download },
            { id: 'network', label: 'Connected Hospital Nodes', icon: Building2 },
            { id: 'audit', label: 'Cryptographic Audit Trail', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by patient, hospital, NHID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 1. INBOUND EXTERNAL RECORDS TAB */}
      {activeTab === 'inbound' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((rec) => {
              const isImported = rec.importStatus === 'Imported into Central EMR';
              return (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 transition flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
                        {rec.nationalHealthId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isImported
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {rec.importStatus}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 font-outfit text-base">{rec.documentType}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Patient: <strong className="text-slate-800">{rec.patientName}</strong> (DOB: {rec.patientDob})
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
                      <div className="text-slate-600">
                        <strong>Source Facility:</strong> {rec.sourceHospitalName}
                      </div>
                      <div className="text-slate-600">
                        <strong>Document Date:</strong> {rec.date} • Attending: {rec.verifiedByDoctor}
                      </div>
                      <div className="text-slate-600 pt-1">
                        <strong>Clinical Summary:</strong> {rec.clinicalSummary}
                      </div>
                      {rec.allergiesConfirmed && (
                        <div className="text-slate-600 pt-1">
                          <strong>Confirmed Allergies:</strong>{' '}
                          {rec.allergiesConfirmed.map((a, i) => (
                            <span key={i} className="bg-white px-1.5 py-0.5 rounded text-[11px] border border-slate-200 mr-1">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
                      SHA-256 Fingerprint: {rec.fhirSha256Hash}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Target: MediNova Central</span>
                    {isImported ? (
                      <span className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span>Reconciled in EMR</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleImportRecord(rec.id, rec.patientName)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Import &amp; Reconcile to Central EMR</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. CONNECTED REGIONAL HOSPITAL NODES TAB */}
      {activeTab === 'network' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 font-outfit text-sm">Certified Inter-Hospital Network Directory</h3>
              <p className="text-xs text-slate-500">Authorized medical facilities participating in regional data exchange.</p>
            </div>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
              mTLS Encrypted
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {hospitals.map((hosp) => (
              <div key={hosp.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-800 text-sm">{hosp.name}</h4>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold">
                      {hosp.networkNode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Location: <strong className="text-slate-700">{hosp.city}</strong> • Protocol: <code className="text-blue-700 bg-slate-100 px-1 py-0.2 rounded font-mono">{hosp.fhirEndpoint}</code>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Certified Since: {hosp.certifiedSince} • Security: {hosp.tlsVersion}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-slate-800">{hosp.recordsAvailable} Records</div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold mt-1 inline-block">
                    {hosp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CRYPTOGRAPHIC AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 font-outfit text-sm">Inter-Hospital Cryptographic Exchange Ledger</h3>
              <p className="text-xs text-slate-500">Legally binding, tamper-evident audit history of all exchanged patient files.</p>
            </div>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-bold">
              SHA-256 Validated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Audit ID</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Source Facility</th>
                  <th className="p-3">Destination Facility</th>
                  <th className="p-3">Patient / NHID</th>
                  <th className="p-3">Payload Type</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition font-sans">
                    <td className="p-3 font-mono font-bold text-blue-700">{log.id}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.direction === 'OUTBOUND_DISPATCH'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {log.direction}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{log.sourceFacility}</td>
                    <td className="p-3 text-slate-700 font-medium">{log.targetFacility}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{log.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.nationalHealthId}</div>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">{log.payloadType}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-blue-700 font-bold text-[10px] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Dispatch Patient Transfer Dossier */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <span>Dispatch Outbound Clinical Transfer Dossier</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cryptographically bundle and dispatch patient health records to a certified partner medical facility.
            </p>

            <form onSubmit={handleDispatchDossier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient</label>
                <select
                  value={dispatchData.patientId}
                  onChange={(e) => setDispatchData({ ...dispatchData, patientId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Blood: {p.bloodGroup || 'O+'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Receiving Facility</label>
                <select
                  value={dispatchData.targetHospitalId}
                  onChange={(e) => setDispatchData({ ...dispatchData, targetHospitalId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                >
                  {hospitals.filter(h => h.id !== 'hosp_central').map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {h.city} ({h.networkNode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transfer Clinical Reason</label>
                <input
                  type="text"
                  value={dispatchData.transferReason}
                  onChange={(e) => setDispatchData({ ...dispatchData, transferReason: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physician Referral Notes</label>
                <textarea
                  rows={3}
                  value={dispatchData.notes}
                  onChange={(e) => setDispatchData({ ...dispatchData, notes: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{dispatching ? 'Signing FHIR Bundle...' : 'Sign & Transmit Dossier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
