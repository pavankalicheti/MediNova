import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/bioprinting/printers
router.get('/printers', (req, res) => {
  try {
    res.json({ printers: store.bioPrinters || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve bio-printers' });
  }
});

// GET /api/bioprinting/jobs
router.get('/jobs', (req, res) => {
  try {
    res.json({ jobs: store.bioPrintJobs || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve bio-print jobs' });
  }
});

// POST /api/bioprinting/jobs
router.post('/jobs', (req, res) => {
  try {
    const { organType, patientName, patientId, dimensionsMm, scaffoldMaterial, intendedSurgeon } = req.body;
    if (!organType) {
      return res.status(400).json({ error: 'Organ type is required' });
    }

    const newJob = {
      id: 'job_bio_' + Date.now(),
      patientId: patientId || 'usr_pat_1',
      patientName: patientName || 'Sarah Jenkins',
      organType,
      dimensionsMm: dimensionsMm || '35 x 35 x 3.0 mm',
      cellViabilityPercent: 97.4,
      extrusionProgressPercent: 5,
      estimatedCompletionMinutes: 35,
      scaffoldMaterial: scaffoldMaterial || 'Polycaprolactone (PCL) + GelMA Bio-Ink',
      intendedSurgeon: intendedSurgeon || 'Dr. Marcus Vance',
      biocompatibilityRating: 'Autologous iPSC Matched (100% HLA Concordance)',
      status: 'In-Progress / Extruding',
      startedAt: new Date().toISOString(),
      microVascularDensity: '860 capillaries/mm²'
    };

    if (!store.bioPrintJobs) store.bioPrintJobs = [];
    store.bioPrintJobs.unshift(newJob);

    // Update printer state
    if (store.bioPrinters && store.bioPrinters.length > 0) {
      store.bioPrinters[0].status = 'Extruding / Active Synthesis';
      store.bioPrinters[0].activeJobId = newJob.id;
    }

    res.status(201).json({
      message: `Bio-printing synthesis initiated for ${organType}. Extruding live cell layers.`,
      job: newJob
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate bio-print job' });
  }
});

// POST /api/bioprinting/printers/:id/calibrate
router.post('/printers/:id/calibrate', (req, res) => {
  try {
    const printer = (store.bioPrinters || []).find(p => p.id === req.params.id);
    if (!printer) {
      return res.status(404).json({ error: 'Bio-printer unit not found' });
    }

    printer.nozzleTemperatureC = 37.0;
    printer.printResolutionMicrons = 10;
    printer.chamberSterility = 'Class 100 Laminar Bio-Enclosure (ISO 5) - Recalibrated';

    res.json({
      message: `Unit ${printer.name} calibrated at 37.0°C and 10µm micro-pore extrusion resolution.`,
      printer
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calibrate printer' });
  }
});

export default router;
