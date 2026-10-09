import express from 'express';
import { store } from '../db/store.js';
import { calculateTriagePriority } from '../utils/triageEngine.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/triage/queue (Get emergency triage queue sorted by priority & score)
router.get('/queue', authenticateToken, (req, res) => {
  const priorityOrder = { Critical: 4, Urgent: 3, Moderate: 2, Low: 1 };

  const sortedQueue = [...store.triageQueue].sort((a, b) => {
    const pA = priorityOrder[a.priorityResult.priority] || 0;
    const pB = priorityOrder[b.priorityResult.priority] || 0;
    if (pB !== pA) return pB - pA;
    return b.priorityResult.score - a.priorityResult.score;
  });

  res.json({ queue: sortedQueue });
});

// POST /api/triage/evaluate (Submit symptoms & vitals for AI evaluation)
router.post('/evaluate', authenticateToken, (req, res) => {
  const { patientName, age, gender, contact, symptoms, heartRate, bpSys, bpDia, spo2, temperature } = req.body;

  if (!heartRate || !bpSys || !spo2) {
    return res.status(400).json({ message: 'Vitals (Heart Rate, Blood Pressure, and Oxygen Level) are required.' });
  }

  const priorityResult = calculateTriagePriority({
    age,
    symptoms: symptoms || [],
    heartRate,
    bpSys,
    bpDia,
    spo2,
    temperature
  });

  const triageEntry = {
    id: `trg_${Date.now()}`,
    patientName: patientName || req.user.name || 'Anonymous Emergency Patient',
    age: parseInt(age) || 30,
    gender: gender || 'Unspecified',
    contact: contact || '+1 (555) 911-0000',
    symptoms: Array.isArray(symptoms) ? symptoms.join(', ') : (symptoms || 'General Distress'),
    heartRate: parseFloat(heartRate),
    bpSys: parseFloat(bpSys),
    bpDia: parseFloat(bpDia) || 80,
    spo2: parseFloat(spo2),
    temperature: parseFloat(temperature) || 37.0,
    priorityResult,
    status: 'Active ER Queue',
    submittedAt: new Date().toISOString()
  };

  store.triageQueue.unshift(triageEntry);

  res.status(201).json({
    message: 'Triage evaluation complete',
    triageEntry
  });
});

// PUT /api/triage/:id/status (Doctor updates triage status: Triaged, Admitted, Discharged)
router.put('/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const entry = store.triageQueue.find(t => t.id === id);
  if (!entry) {
    return res.status(404).json({ message: 'Triage record not found.' });
  }

  entry.status = status || 'Triaged';

  res.json({
    message: `Triage record status updated to ${entry.status}`,
    entry
  });
});

export default router;
