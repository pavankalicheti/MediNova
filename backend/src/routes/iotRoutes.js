import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/iot/devices (Get connected IoT devices)
router.get('/devices', authenticateToken, (req, res) => {
  const { role, id } = req.user;

  if (role === 'Patient') {
    const devices = (store.iotDevices || []).filter(d => d.patientId === id);
    return res.json({ devices });
  }

  // Doctors and Admins see all connected patient devices
  res.json({ devices: store.iotDevices || [] });
});

// POST /api/iot/devices (Pair new wearable device)
router.post('/devices', authenticateToken, (req, res) => {
  const { deviceName, model, type, connectionType, patientId } = req.body;

  if (!deviceName) {
    return res.status(400).json({ message: 'Device name is required.' });
  }

  const user = store.users.find(u => u.id === (patientId || req.user.id));
  const patientName = user ? user.name : 'Registered Patient';

  const newDevice = {
    id: `iot_dev_${Date.now()}`,
    patientId: user ? user.id : req.user.id,
    patientName,
    deviceName,
    model: model || 'MediNova BioPatch Standard',
    type: type || 'Wearable Biosensor',
    connectionType: connectionType || 'Bluetooth 5.3 Low Energy',
    status: 'Connected',
    battery: 100,
    signalStrength: -48,
    lastSync: new Date().toISOString(),
    currentVitals: {
      heartRate: 72,
      spO2: 99,
      bpSys: 120,
      bpDia: 80,
      temperature: 36.7,
      bloodGlucose: 100,
      respirationRate: 16
    },
    alertThresholds: {
      hrMax: 110,
      hrMin: 50,
      spo2Min: 94,
      bpSysMax: 140,
      bpDiaMax: 90
    }
  };

  if (!store.iotDevices) store.iotDevices = [];
  store.iotDevices.unshift(newDevice);

  res.status(201).json({
    message: 'Wearable IoT device paired successfully',
    device: newDevice
  });
});

// PUT /api/iot/devices/:id/vitals (Update simulated live vitals)
router.put('/devices/:id/vitals', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { vitals } = req.body;

  const device = (store.iotDevices || []).find(d => d.id === id);
  if (!device) {
    return res.status(404).json({ message: 'Device not found.' });
  }

  if (vitals) {
    device.currentVitals = { ...device.currentVitals, ...vitals };
    device.lastSync = new Date().toISOString();

    // Check for abnormal thresholds to auto-trigger alert
    if (vitals.heartRate && (vitals.heartRate > 115 || vitals.heartRate < 48)) {
      const alt = {
        id: `alt_${Date.now()}`,
        patientId: device.patientId,
        patientName: device.patientName,
        deviceId: device.id,
        vitalType: 'Heart Rate Spike',
        value: `${vitals.heartRate} bpm`,
        threshold: 'Normal 60-100 bpm',
        severity: vitals.heartRate > 130 ? 'Critical' : 'Moderate',
        status: 'Active Alert',
        triggeredAt: new Date().toISOString(),
        actionTaken: 'Automated notification sent to attending cardiology team.'
      };
      if (!store.iotAlerts) store.iotAlerts = [];
      store.iotAlerts.unshift(alt);
    }
  }

  res.json({
    message: 'Telemetry updated',
    device
  });
});

// POST /api/iot/devices/:id/sync (Trigger manual sync)
router.post('/devices/:id/sync', authenticateToken, (req, res) => {
  const { id } = req.params;
  const device = (store.iotDevices || []).find(d => d.id === id);
  if (!device) {
    return res.status(404).json({ message: 'Device not found.' });
  }

  device.lastSync = new Date().toISOString();
  // Small random realistic jitter in vitals
  device.currentVitals.heartRate = Math.round(72 + (Math.random() * 8 - 4));
  device.currentVitals.spO2 = Math.min(100, Math.round(98 + (Math.random() * 2 - 1)));

  res.json({
    message: 'Device synchronized successfully',
    device
  });
});

// DELETE /api/iot/devices/:id (Disconnect device)
router.delete('/devices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const idx = (store.iotDevices || []).findIndex(d => d.id === id);
  if (idx !== -1) {
    store.iotDevices.splice(idx, 1);
    return res.json({ message: 'Device disconnected successfully' });
  }
  res.status(404).json({ message: 'Device not found' });
});

// GET /api/iot/telemetry (Time-series vital charts)
router.get('/telemetry', authenticateToken, (req, res) => {
  res.json({ telemetryLogs: store.iotTelemetryLogs || [] });
});

// GET /api/iot/alerts (Vitals threshold breach notifications)
router.get('/alerts', authenticateToken, (req, res) => {
  const { role, id } = req.user;
  if (role === 'Patient') {
    const alerts = (store.iotAlerts || []).filter(a => a.patientId === id);
    return res.json({ alerts });
  }
  res.json({ alerts: store.iotAlerts || [] });
});

export default router;
