import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/records
// - Patient gets their own records
// - Doctor, Receptionist, Admin get all records (or filtered by patientId)
router.get('/', authenticateToken, (req, res) => {
  const { patientId } = req.query;

  if (req.user.role === 'Patient') {
    const patientRecords = store.records.filter(r => r.patientId === req.user.id);
    return res.json({ records: patientRecords });
  }

  if (patientId) {
    const records = store.records.filter(r => r.patientId === patientId);
    return res.json({ records });
  }

  res.json({ records: store.records });
});

// POST /api/records (Doctors add/update records for patients)
router.post('/', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { patientId, diagnosis, symptoms, prescriptions, labResults, doctorNotes } = req.body;

  if (!patientId || !diagnosis) {
    return res.status(400).json({ message: 'Patient selection and diagnosis are required.' });
  }

  const patient = store.users.find(u => u.id === patientId && u.role === 'Patient');
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found.' });
  }

  const doctor = store.users.find(u => u.id === req.user.id);

  const newRecord = {
    id: `rec_${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    doctorId: req.user.id,
    doctorName: doctor ? doctor.name : 'Dr. Medical Staff',
    date: new Date().toISOString().split('T')[0],
    diagnosis,
    symptoms: symptoms || 'None specified',
    prescriptions: Array.isArray(prescriptions) ? prescriptions : (prescriptions ? [{ name: prescriptions, dosage: 'As directed', frequency: 'Daily' }] : []),
    labResults: labResults || 'Pending lab report',
    doctorNotes: doctorNotes || ''
  };

  store.records.unshift(newRecord);

  // Update patient medical history summary as well
  const patientIdx = store.users.findIndex(u => u.id === patientId);
  if (patientIdx !== -1) {
    store.users[patientIdx].medicalHistory = `${store.users[patientIdx].medicalHistory || ''} [Updated ${newRecord.date}]: ${diagnosis}.`.trim();
  }

  res.status(201).json({
    message: 'Medical record created successfully',
    record: newRecord
  });
});

export default router;
