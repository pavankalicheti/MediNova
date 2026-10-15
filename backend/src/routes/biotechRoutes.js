import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/biotech/bci-sessions (List Neural BCI motor decoding sessions)
router.get('/bci-sessions', authenticateToken, (req, res) => {
  res.json({ sessions: store.neuralBciSessions || [] });
});

// POST /api/biotech/bci-calibrate (Run 64-channel neural decoding calibration)
router.post('/bci-calibrate', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { patientId, taskType } = req.body;

  const patient = store.users.find(u => u.id === patientId) || { name: 'John Doe', id: 'usr_pat_2' };

  const newSession = {
    id: `bci_ses_${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    condition: 'Motor Cortex Neuro-Rehabilitation (Sensorimotor Strip)',
    bciArrayType: 'High-Density 64-Channel EEG/ECoG Sensor Array (C3/Cz/C4)',
    samplingRateHz: 2048,
    decodingAccuracyPercent: parseFloat((93.5 + Math.random() * 5.0).toFixed(1)),
    muBetaRhythmSuppression: 'Active Event-Related Desynchronization (ERD: -4.1 dB)',
    sessionDate: new Date().toISOString().split('T')[0],
    rehabScoreProgress: '+22% Neuroplasticity Functional Score',
    prostheticGraspIntention: taskType || 'Precision Pinch & Opposable Grip Calibrated'
  };

  if (!store.neuralBciSessions) store.neuralBciSessions = [];
  store.neuralBciSessions.unshift(newSession);

  res.status(201).json({
    message: 'Neural Brain-Computer Interface calibrated. 64-channel motor intention decoded with high accuracy.',
    session: newSession
  });
});

// GET /api/biotech/nanorobotics (List active cellular nano-bot swarms)
router.get('/nanorobotics', authenticateToken, (req, res) => {
  res.json({ swarms: store.nanoroboticsSwarms || [] });
});

// POST /api/biotech/nanorobotics/steer (Command magnetic steering & drug payload release)
router.post('/nanorobotics/steer', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { swarmId, magneticFieldTesla, targetAction } = req.body;

  const swarm = (store.nanoroboticsSwarms || []).find(s => s.id === swarmId) || store.nanoroboticsSwarms[0];

  if (swarm) {
    swarm.steeringMethod = `External Rotating Gradient (${magneticFieldTesla || '3.5'} Tesla Resonance)`;
    swarm.microVascularClearancePercent = Math.min(100, swarm.microVascularClearancePercent + 4.5);
    swarm.status = targetAction || 'Magnetic Field Steered to Target Tissue Margins';
  }

  res.json({
    message: `Nano-robotic magnetic field vectors adjusted. Cellular payload release activated.`,
    swarm
  });
});

export default router;
