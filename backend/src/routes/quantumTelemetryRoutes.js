import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/quantum/nodes (List active QKD nodes and quantum channels)
router.get('/nodes', authenticateToken, (req, res) => {
  res.json({ nodes: store.quantumNodes || [] });
});

// GET /api/quantum/telemetry-stream (Get real-time encrypted telemetry stream)
router.get('/telemetry-stream', authenticateToken, (req, res) => {
  res.json({ stream: store.quantumTelemetryStream || [] });
});

// POST /api/quantum/rotate-keys (Regenerate QKD entropy and rotate session keys)
router.post('/rotate-keys', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { nodeId } = req.body;
  const node = (store.quantumNodes || []).find(n => n.id === (nodeId || 'qkd_node_central'));

  if (!node) {
    return res.status(404).json({ message: 'Quantum node not found.' });
  }

  // Generate new post-quantum session key
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  node.sessionKeyId = `QKEY-KYBER-${randomHex}-SECURE`;
  node.keyTimeRemainingSeconds = node.keyLifespanSeconds;
  node.qberPercent = parseFloat((1.1 + Math.random() * 0.4).toFixed(2));
  node.eavesdropperDetected = false;
  node.status = 'Active (QKD Entangled)';

  const auditEntry = {
    id: `qlog_${Date.now()}`,
    timestamp: new Date().toISOString(),
    nodeId: node.id,
    eventType: 'QKD_SESSION_ROTATION',
    protocol: 'NIST ML-KEM (Kyber-1024) / BB84',
    details: `Entropy re-seeded by ${req.user.name}. New session key ${node.sessionKeyId} active with QBER ${node.qberPercent}%.`
  };

  if (!store.quantumAuditLog) store.quantumAuditLog = [];
  store.quantumAuditLog.unshift(auditEntry);

  res.json({
    message: `Quantum key distribution entropy regenerated for ${node.name}. Post-quantum session keys successfully rotated.`,
    node,
    auditEntry
  });
});

// POST /api/quantum/simulate-breach (Simulate eavesdropping / quantum state decoherence)
router.post('/simulate-breach', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { nodeId } = req.body;
  const node = (store.quantumNodes || []).find(n => n.id === (nodeId || 'qkd_node_central'));

  if (!node) {
    return res.status(404).json({ message: 'Quantum node not found.' });
  }

  // Trigger quantum state collapse (QBER spikes above safety threshold 4.5%)
  node.qberPercent = 14.82;
  node.eavesdropperDetected = true;
  node.status = 'ALERT: Quantum State Collapse / Potential Intercept';

  const auditEntry = {
    id: `qlog_${Date.now()}`,
    timestamp: new Date().toISOString(),
    nodeId: node.id,
    eventType: 'QUANTUM_BREACH_DETECTED',
    protocol: 'Photon Polarization Verification (No-Cloning Violation)',
    details: `Anomalous quantum state decoherence detected! QBER spiked to 14.82% (Threshold: 4.5%). Compromised session key immediately revoked per BB84 protocol.`
  };

  if (!store.quantumAuditLog) store.quantumAuditLog = [];
  store.quantumAuditLog.unshift(auditEntry);

  res.json({
    message: 'Simulated eavesdropper detected! Quantum entanglement collapsed and photon polarization altered. Safety interlock triggered.',
    node,
    auditEntry
  });
});

// POST /api/quantum/reset-breach (Restore safe quantum channel)
router.post('/reset-breach', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { nodeId } = req.body;
  const node = (store.quantumNodes || []).find(n => n.id === (nodeId || 'qkd_node_central'));

  if (!node) {
    return res.status(404).json({ message: 'Quantum node not found.' });
  }

  node.qberPercent = 1.22;
  node.eavesdropperDetected = false;
  node.status = 'Active (QKD Entangled)';
  node.sessionKeyId = `QKEY-KYBER-${Date.now().toString().slice(-4)}-RESTORED`;
  node.keyTimeRemainingSeconds = node.keyLifespanSeconds;

  const auditEntry = {
    id: `qlog_${Date.now()}`,
    timestamp: new Date().toISOString(),
    nodeId: node.id,
    eventType: 'QUANTUM_LINK_RESTORED',
    protocol: 'Clean Entanglement Fiber Re-alignment',
    details: `Optical conduit re-calibrated by ${req.user.name}. QBER normalized to 1.22%. Telemetry encryption resumed.`
  };

  if (!store.quantumAuditLog) store.quantumAuditLog = [];
  store.quantumAuditLog.unshift(auditEntry);

  res.json({
    message: 'Quantum communication link restored. Entangled photon stream re-established.',
    node,
    auditEntry
  });
});

// GET /api/quantum/audit-log (Quantum cryptography audit log)
router.get('/audit-log', authenticateToken, (req, res) => {
  res.json({ auditLog: store.quantumAuditLog || [] });
});

export default router;
