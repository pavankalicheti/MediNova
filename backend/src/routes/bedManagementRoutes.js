import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/beds/wards (List all wards, beds, and occupancy stats)
router.get('/wards', authenticateToken, (req, res) => {
  res.json({ wards: store.hospitalWards || [] });
});

// POST /api/beds/assign (Assign patient to bed)
router.post('/assign', authenticateToken, authorizeRoles('Doctor', 'Admin', 'Receptionist'), (req, res) => {
  const { wardId, bedId, patientId, diagnosis, attendingNurse } = req.body;

  const ward = (store.hospitalWards || []).find(w => w.id === wardId);
  if (!ward) return res.status(404).json({ message: 'Ward not found.' });

  const bed = ward.beds.find(b => b.id === bedId);
  if (!bed) return res.status(404).json({ message: 'Bed not found.' });

  if (bed.status === 'Occupied') {
    return res.status(400).json({ message: 'This bed is currently occupied.' });
  }

  const patient = store.users.find(u => u.id === patientId) || { name: 'Admitted Patient', id: patientId };

  bed.status = 'Occupied';
  bed.patientName = patient.name;
  bed.patientId = patient.id;
  bed.admissionDate = new Date().toISOString().split('T')[0];
  bed.diagnosis = diagnosis || 'Inpatient Clinical Care';
  bed.attendingNurse = attendingNurse || 'Assigned Floor Nurse';
  bed.vitals = { hr: 75, bp: '120/80', spo2: 98 };

  // Recalculate ward stats
  ward.occupiedBeds = ward.beds.filter(b => b.status === 'Occupied').length;
  ward.availableBeds = ward.beds.filter(b => b.status === 'Available / Clean').length;
  ward.turnoverSanitizingBeds = ward.beds.filter(b => b.status.includes('Sanitizing')).length;

  res.json({
    message: `Patient ${patient.name} assigned to Bed ${bed.id} in ${ward.name}.`,
    bed,
    ward
  });
});

// POST /api/beds/discharge (Discharge patient from bed)
router.post('/discharge', authenticateToken, authorizeRoles('Doctor', 'Admin', 'Receptionist'), (req, res) => {
  const { wardId, bedId } = req.body;

  const ward = (store.hospitalWards || []).find(w => w.id === wardId);
  if (!ward) return res.status(404).json({ message: 'Ward not found.' });

  const bed = ward.beds.find(b => b.id === bedId);
  if (!bed) return res.status(404).json({ message: 'Bed not found.' });

  const formerPatient = bed.patientName;
  bed.status = 'Sanitizing / Turnover';
  bed.patientName = null;
  bed.patientId = null;
  bed.admissionDate = null;
  bed.diagnosis = 'Disinfection & Robotic UV-C Turnover';
  bed.vitals = null;

  ward.occupiedBeds = ward.beds.filter(b => b.status === 'Occupied').length;
  ward.availableBeds = ward.beds.filter(b => b.status === 'Available / Clean').length;
  ward.turnoverSanitizingBeds = ward.beds.filter(b => b.status.includes('Sanitizing')).length;

  res.json({
    message: `${formerPatient || 'Patient'} discharged from Bed ${bed.id}. Bed marked for rapid sanitization.`,
    bed,
    ward
  });
});

// POST /api/beds/sanitize (Mark bed sanitized and ready)
router.post('/sanitize', authenticateToken, (req, res) => {
  const { wardId, bedId } = req.body;

  const ward = (store.hospitalWards || []).find(w => w.id === wardId);
  if (!ward) return res.status(404).json({ message: 'Ward not found.' });

  const bed = ward.beds.find(b => b.id === bedId);
  if (!bed) return res.status(404).json({ message: 'Bed not found.' });

  bed.status = 'Available / Clean';
  bed.diagnosis = null;
  bed.telemetryStatus = 'Calibrated / Ready for Intake';

  ward.occupiedBeds = ward.beds.filter(b => b.status === 'Occupied').length;
  ward.availableBeds = ward.beds.filter(b => b.status === 'Available / Clean').length;
  ward.turnoverSanitizingBeds = ward.beds.filter(b => b.status.includes('Sanitizing')).length;

  res.json({
    message: `Bed ${bed.id} sanitized and certified ready for intake.`,
    bed,
    ward
  });
});

export default router;
