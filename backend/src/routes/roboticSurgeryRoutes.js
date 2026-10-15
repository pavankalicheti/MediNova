import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/robotic-surgery/suites (List robotic operating suites)
router.get('/suites', authenticateToken, (req, res) => {
  res.json({ suites: store.roboticSuites || [] });
});

// GET /api/robotic-surgery/suites/:id (Get single suite detail)
router.get('/suites/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const suite = (store.roboticSuites || []).find(s => s.id === id);

  if (!suite) {
    return res.status(404).json({ message: 'Robotic surgical suite not found.' });
  }

  res.json({ suite });
});

// POST /api/robotic-surgery/suites/:id/control (Transfer master control authority)
router.post('/suites/:id/control', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { id } = req.params;
  const { mode } = req.body; // 'remote' or 'bedside'

  const suite = (store.roboticSuites || []).find(s => s.id === id);
  if (!suite) {
    return res.status(404).json({ message: 'Robotic suite not found.' });
  }

  const isRemote = mode === 'remote';
  suite.status = isRemote ? 'Live Tele-Presence Active' : 'Bedside Manual Override Active';

  const logEntry = {
    id: `surg_log_${Date.now()}`,
    suiteId: suite.id,
    timestamp: new Date().toISOString(),
    eventType: isRemote ? 'TELE_CONTROL_ENGAGED' : 'BEDSIDE_OVERRIDE_ENGAGED',
    surgeon: req.user.name,
    details: isRemote
      ? `Master robotic tele-presence transferred to remote console authorized by ${req.user.name}.`
      : `Bedside surgeon initiated local robotic master override. Remote console set to observer mode.`,
    networkLatency: `${suite.latencyMs}ms`
  };

  if (!store.roboticSurgicalLogs) store.roboticSurgicalLogs = [];
  store.roboticSurgicalLogs.unshift(logEntry);

  res.json({
    message: `Master control authority switched to ${isRemote ? 'Remote Tele-Surgeon' : 'Bedside Operating Console'}.`,
    suite,
    logEntry
  });
});

// POST /api/robotic-surgery/suites/:id/calibrate (Run sub-millisecond haptic calibration)
router.post('/suites/:id/calibrate', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { id } = req.params;
  const suite = (store.roboticSuites || []).find(s => s.id === id);

  if (!suite) {
    return res.status(404).json({ message: 'Robotic suite not found.' });
  }

  // Update calibration metrics
  suite.latencyMs = parseFloat((2.8 + Math.random() * 0.9).toFixed(1));
  suite.jitterMs = parseFloat((0.1 + Math.random() * 0.15).toFixed(2));
  suite.safetyInterlock = 'Calibrated & Arm Safe-Zone Locked';

  const logEntry = {
    id: `surg_log_${Date.now()}`,
    suiteId: suite.id,
    timestamp: new Date().toISOString(),
    eventType: 'HAPTIC_CALIBRATION_COMPLETED',
    surgeon: req.user.name,
    details: `Bilateral 1000Hz haptic feedback loop calibrated with 0.02mm optical drift correction. Roundtrip latency: ${suite.latencyMs}ms.`,
    networkLatency: `${suite.latencyMs}ms`
  };

  if (!store.roboticSurgicalLogs) store.roboticSurgicalLogs = [];
  store.roboticSurgicalLogs.unshift(logEntry);

  res.json({
    message: 'Sub-millisecond optical & haptic calibration successfully synchronized.',
    suite,
    logEntry
  });
});

// POST /api/robotic-surgery/suites/:id/emergency-stop (Emergency safe stop)
router.post('/suites/:id/emergency-stop', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { id } = req.params;
  const suite = (store.roboticSuites || []).find(s => s.id === id);

  if (!suite) {
    return res.status(404).json({ message: 'Robotic suite not found.' });
  }

  suite.status = 'EMERGENCY SOFT-STOP ENGAGED';
  suite.safetyInterlock = 'HALTED (All Instrument Joints Clamped & Locked)';

  // Set all arms to paused/locked
  suite.arms.forEach(arm => {
    arm.status = 'EMERGENCY LOCKED';
    arm.gripForceN = 0;
  });

  const logEntry = {
    id: `surg_log_${Date.now()}`,
    suiteId: suite.id,
    timestamp: new Date().toISOString(),
    eventType: 'EMERGENCY_STOP_ACTIVATED',
    surgeon: req.user.name,
    details: `Immediate emergency brake command issued by ${req.user.name}. All kinetic arms frozen in place.`,
    networkLatency: `${suite.latencyMs}ms`
  };

  if (!store.roboticSurgicalLogs) store.roboticSurgicalLogs = [];
  store.roboticSurgicalLogs.unshift(logEntry);

  res.json({
    message: 'Emergency soft-stop engaged. All robotic arms safely frozen in current anatomical envelope.',
    suite,
    logEntry
  });
});

// POST /api/robotic-surgery/schedule (Schedule upcoming tele-robotic surgical case)
router.post('/schedule', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { suiteId, patientId, procedureName, leadSurgeon, plannedDate } = req.body;

  const patient = store.users.find(u => u.id === patientId);
  const suite = (store.roboticSuites || []).find(s => s.id === suiteId);

  if (!patient || !suite) {
    return res.status(400).json({ message: 'Valid patient and robotic surgical suite must be specified.' });
  }

  suite.currentProcedure = procedureName || 'Minimally Invasive Tele-Robotic Resection';
  suite.patientName = patient.name;
  suite.patientId = patient.id;
  suite.activeSurgeon = leadSurgeon || req.user.name;
  suite.status = 'Scheduled / Tele-Presence Calibrated';

  res.status(201).json({
    message: `Tele-robotic surgery '${suite.currentProcedure}' scheduled for ${patient.name} in ${suite.name}.`,
    suite
  });
});

// GET /api/robotic-surgery/logs (Audit trail of tele-robotic operations)
router.get('/logs', authenticateToken, (req, res) => {
  res.json({ logs: store.roboticSurgicalLogs || [] });
});

export default router;
