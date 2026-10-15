import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Radio,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Database,
  Terminal,
  Activity,
  Zap,
  Eye,
  Sliders
} from 'lucide-react';

export default function QuantumTelemetryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stream'); // 'stream', 'nodes', 'algorithms', 'audit'
  const [nodes, setNodes] = useState([]);
  const [stream, setStream] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState('qkd_node_central');
  const [notification, setNotification] = useState('');
  const [rotating, setRotating] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [nodesRes, streamRes, auditRes] = await Promise.all([
        api.getQuantumNodes(),
        api.getQuantumTelemetryStream(),
        api.getQuantumAuditLog()
      ]);

      setNodes(nodesRes.nodes || []);
      setStream(streamRes.stream || []);
      setAuditLog(auditRes.auditLog || []);
    } catch (err) {
      console.error('Failed to load quantum telemetry data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0] || null;

  // Key Rotation Action
  const handleRotateKeys = async () => {
    try {
      setRotating(true);
      const res = await api.rotateQuantumKeys({ nodeId: selectedNodeId });
      setNotification(res.message);
      await loadData();
      setTimeout(() => setNotification(''), 6000);
    } catch (err) {
      alert('Failed to rotate keys: ' + err.message);
    } finally {
      setRotating(false);
    }
  };

  // Simulate Eavesdropping Breach
  const handleSimulateBreach = async () => {
    try {
      setSimulating(true);
      const res = await api.simulateQuantumBreach({ nodeId: selectedNodeId });
      setNotification(res.message);
      await loadData();
      setTimeout(() => setNotification(''), 7000);
    } catch (err) {
      alert('Failed to simulate breach: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  // Restore Clean Link
  const handleResetBreach = async () => {
    try {
      const res = await api.resetQuantumBreach({ nodeId: selectedNodeId });
      setNotification(res.message);
      await loadData();
      setTimeout(() => setNotification(''), 6000);
    } catch (err) {
      alert('Failed to reset link: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-blue-600">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Initializing Quantum Key Distribution (BB84 / Kyber-1024)...
        </p>
      </div>
    );
  }

  const isBreached = selectedNode?.eavesdropperDetected;

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {notification && (
        <div className={`p-3.5 border text-xs rounded-xl flex items-center justify-between shadow-sm animate-fade-in ${
          isBreached
            ? 'bg-blue-100 border-blue-300 text-blue-900 font-bold'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {isBreached ? (
              <AlertTriangle className="w-4 h-4 text-blue-800 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span className="font-medium">{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-blue-500 hover:text-blue-700">
            &times;
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Shield className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-outfit">
                Quantum-Encrypted Telemetry &amp; Post-Quantum Cryptography
              </h1>
              <p className="text-xs text-slate-500">
                Post-Quantum Cryptography (PQC NIST ML-KEM/Kyber-1024), Entangled Photon QKD (BB84), and Zero-Trust Clinical Telemetry Security.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Rotate Keys Button */}
          <button
            onClick={handleRotateKeys}
            disabled={rotating}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Key className={`w-3.5 h-3.5 ${rotating ? 'animate-spin' : ''}`} />
            <span>{rotating ? 'Regenerating...' : 'Regenerate QKD Entropy Key'}</span>
          </button>

          {/* Simulate Eavesdropper Breach Button */}
          {!isBreached ? (
            <button
              onClick={handleSimulateBreach}
              disabled={simulating}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Eavesdropping Attack</span>
            </button>
          ) : (
            <button
              onClick={handleResetBreach}
              className="px-3.5 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Restore Quantum Entanglement</span>
            </button>
          )}
        </div>
      </div>

      {/* QKD Nodes Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const nodeBreached = node.eavesdropperDetected;

          return (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-400 shadow-sm ring-1 ring-blue-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {node.id.toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  nodeBreached
                    ? 'bg-blue-100 text-blue-900 border-blue-400 font-mono animate-pulse'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {nodeBreached ? '● State Decoherence Alert' : node.status}
                </span>
              </div>

              <div className="font-bold text-slate-800 text-sm font-outfit truncate">
                {node.name}
              </div>

              <div className="text-xs text-slate-500 mt-1 truncate">
                Medium: <strong className="text-slate-700">{node.physicalMedium}</strong>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">QBER Rate</span>
                  <span className={`font-bold ${nodeBreached ? 'text-blue-900 font-black' : 'text-blue-700'}`}>
                    {node.qberPercent}% <span className="text-[9px] text-slate-400 font-normal">(Limit: {node.qberThreshold}%)</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Photon Flux</span>
                  <span className="text-slate-700 font-bold">{node.rawPhotonFlux}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Cryptographic Status Card */}
      {selectedNode && (
        <div className={`p-5 rounded-2xl border shadow-sm transition-all ${
          isBreached ? 'bg-blue-50/70 border-blue-300' : 'bg-white border-slate-200'
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Active Session Key</span>
              <div className="font-mono font-bold text-blue-800 text-xs truncate" title={selectedNode.sessionKeyId}>
                {selectedNode.sessionKeyId}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Post-Quantum Standard</span>
              <div className="font-bold text-slate-800 text-xs">
                {selectedNode.postQuantumAlgorithm}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Key Generation Rate</span>
              <div className="font-bold text-blue-700 font-mono text-xs">
                {selectedNode.keyGenRateKbps} kbps (BB84 Clean Sifted)
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Session Key Validity</span>
              <div className="font-bold text-slate-700 font-mono text-xs">
                {selectedNode.keyTimeRemainingSeconds}s remaining / {selectedNode.keyLifespanSeconds}s
              </div>
            </div>
          </div>

          {isBreached && (
            <div className="mt-4 pt-3 border-t border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Automated Quantum Interlock Triggered: </strong>
                Photon polarization measurements indicate eavesdropper intervention. Quantum bit error rate ({selectedNode.qberPercent}%) exceeds the 4.5% Shannon secrecy capacity threshold. Key material immediately revoked.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('stream')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'stream'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Live Quantum Cipher Stream</span>
        </button>

        <button
          onClick={() => setActiveTab('algorithms')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'algorithms'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Post-Quantum Algorithms (NIST PQC)</span>
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
          <span>Cryptographic Audit Ledger</span>
        </button>
      </div>

      {/* TAB 1: LIVE QUANTUM CIPHER STREAM */}
      {activeTab === 'stream' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 font-outfit text-sm">
                  ICU Clinical Telemetry Quantum Decryption Terminal
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time clinical biosignals shielded with post-quantum encapsulation and single-photon entropy keys.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                E2E Encrypted
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {stream.map((pkt) => (
                <div key={pkt.packetId} className="p-5 hover:bg-slate-50/70 transition space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded-lg border border-blue-200">
                        {pkt.packetId}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          {pkt.patientName} ({pkt.patientId})
                        </div>
                        <div className="text-xs text-slate-500">
                          Channel: <strong className="text-slate-700 font-medium">{pkt.telemetrySource}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                        {pkt.encryptionStandard}
                      </span>
                    </div>
                  </div>

                  {/* Dual Payload Viewer (Raw Clinical Payload vs Ciphertext Hex) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-blue-600" />
                        Transmitted Quantum Ciphertext (Hex Block)
                      </span>
                      <div className="font-mono text-blue-900 text-[11px] break-all bg-white p-2 rounded-lg border border-slate-200">
                        {pkt.ciphertextHex}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold flex items-center gap-1.5">
                        <Unlock className="w-3 h-3 text-blue-600" />
                        Decrypted Clinical Vital Signs (Patient Monitor Output)
                      </span>
                      <div className="font-mono text-slate-800 text-[11px] font-bold bg-white p-2 rounded-lg border border-slate-200">
                        {pkt.rawPayload}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Digital Signature: <strong>{pkt.signatureAlgorithm}</strong></span>
                    <span>Entropy Source: <strong>{pkt.qkdEntropyUsed}</strong></span>
                    <span className="text-blue-700 font-bold">{pkt.integrityStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POST-QUANTUM ALGORITHM SUITE */}
      {activeTab === 'algorithms' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-outfit">
                NIST Post-Quantum Cryptographic Standards (FIPS 203, 204, 205)
              </h3>
              <p className="text-xs text-slate-500">
                Lattice-based and stateless hash-based algorithms provably resilient against both classical and quantum Shor's factorizations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  NIST FIPS 203 Primary KEM
                </span>
                <h4 className="font-bold text-slate-800 text-sm font-outfit">ML-KEM (CRYSTALS-Kyber-1024)</h4>
                <p className="text-xs text-slate-600">
                  Module-Lattice key encapsulation mechanism providing NIST Security Level 5 protection for patient telemetry key exchange.
                </p>
                <div className="pt-2 text-[10px] text-slate-500 font-mono">
                  Ciphertext size: 1,568 bytes • Public key: 1,568 bytes
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  NIST FIPS 204 Digital Signature
                </span>
                <h4 className="font-bold text-slate-800 text-sm font-outfit">ML-DSA (CRYSTALS-Dilithium-5)</h4>
                <p className="text-xs text-slate-600">
                  Lattice-based digital signatures validating physician telemetry commands and medical device identity authentication.
                </p>
                <div className="pt-2 text-[10px] text-slate-500 font-mono">
                  Signature size: 4,595 bytes • Security: 256-bit quantum
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  NIST FIPS 205 Hash Signatures
                </span>
                <h4 className="font-bold text-slate-800 text-sm font-outfit">SLH-DSA (SPHINCS+)</h4>
                <p className="text-xs text-slate-600">
                  Stateless hash-based signature scheme providing an independent mathematical backup in the event of lattice cryptanalysis.
                </p>
                <div className="pt-2 text-[10px] text-slate-500 font-mono">
                  Collision-resistant SHA-256 / SHAKE-256 primitives
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LEDGER */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 font-outfit text-sm">
              Quantum Cryptographic Key Handshake &amp; Incident Ledger
            </h3>
            <span className="text-xs text-slate-500">{auditLog.length} Recorded Events</span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLog.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{log.eventType}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-700">{log.protocol}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
