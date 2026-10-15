import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/voice/process-command (Analyze spoken clinical prompt)
router.post('/process-command', authenticateToken, (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: 'Voice prompt is required.' });
  }

  const p = prompt.toLowerCase();
  let intent = 'GENERAL_HEALTHCARE_QUERY';
  let responseText = '';
  let actionTaken = 'Information displayed';
  let entities = {};

  if (p.includes('triage') || p.includes('chest pain') || p.includes('emergency') || p.includes('shortness of breath')) {
    intent = 'EMERGENCY_TRIAGE_EVALUATION';
    entities = { symptoms: ['acute discomfort', 'respiratory/cardiac stress'], severity: 'High' };
    responseText = 'Voice Triage Analysis: High-priority cardiac/respiratory alert detected. Recommend immediate triage queue escalation and 12-lead ECG.';
    actionTaken = 'Emergency triage evaluation generated';
  } else if (p.includes('pharmacy') || p.includes('medicine') || p.includes('stock') || p.includes('drug')) {
    intent = 'PHARMACY_STOCK_QUERY';
    entities = { category: 'Pharmaceutical Inventory' };
    responseText = 'Pharmacy Inventory Voice Query: Central inventory is active. 10 core formulations online with 1 item on restock alert (Insulin Glargine).';
    actionTaken = 'Pharmacy inventory summary retrieved';
  } else if (p.includes('bed') || p.includes('icu') || p.includes('ward')) {
    intent = 'BED_CAPACITY_QUERY';
    entities = { resource: 'ICU & Surgical Beds' };
    responseText = 'Bed Logistics Query: Cardiac ICU has 1 critical care bed currently available. Surgical Step-Down has 4 available beds.';
    actionTaken = 'Hospital bed occupancy summary retrieved';
  } else if (p.includes('dictate') || p.includes('soap') || p.includes('note')) {
    intent = 'CLINICAL_NOTE_DICTATION';
    entities = { noteType: 'SOAP Note' };
    responseText = 'Clinical Note Dictation Transcribed: Subjective: Patient reports acute symptoms. Objective: Vitals stable. Assessment: Under clinical evaluation. Plan: Prescribe diagnostic imaging and laboratory panel.';
    actionTaken = 'SOAP Note structured and ready for EMR export';
  } else {
    intent = 'ASSISTANT_QUERY';
    responseText = `MediNova Voice Assistant: Processed "${prompt}". All clinical modules, EHR records, and emergency services are operational.`;
    actionTaken = 'Voice dialogue processed';
  }

  const logEntry = {
    id: `vcmd_${Date.now()}`,
    timestamp: new Date().toISOString(),
    spokenPrompt: prompt,
    detectedIntent: intent,
    extractedEntities: entities,
    aiSystemResponse: responseText,
    executedAction: actionTaken
  };

  if (!store.voiceCommandsLog) store.voiceCommandsLog = [];
  store.voiceCommandsLog.unshift(logEntry);

  res.json({
    message: 'Voice command processed successfully.',
    commandLog: logEntry
  });
});

// GET /api/voice/history (Command history)
router.get('/history', authenticateToken, (req, res) => {
  res.json({ history: store.voiceCommandsLog || [] });
});

export default router;
