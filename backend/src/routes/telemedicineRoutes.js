import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/telemedicine/sessions
// Patients get their sessions; Doctors get their sessions; Admins/Staff get all
router.get('/sessions', authenticateToken, (req, res) => {
  const { role, id } = req.user;

  if (role === 'Patient') {
    const list = (store.telemedicineSessions || []).filter(s => s.patientId === id);
    return res.json({ sessions: list });
  }

  if (role === 'Doctor') {
    const list = (store.telemedicineSessions || []).filter(s => s.doctorId === id);
    return res.json({ sessions: list });
  }

  // Admin / Receptionist / Pharmacist
  res.json({ sessions: store.telemedicineSessions || [] });
});

// POST /api/telemedicine/sessions (Request/Book virtual consultation)
router.post('/sessions', authenticateToken, (req, res) => {
  const { doctorId, date, timeSlot, reason } = req.body;

  if (!doctorId || !date || !timeSlot) {
    return res.status(400).json({ message: 'Doctor, date, and time slot are required.' });
  }

  const doctor = store.users.find(u => u.id === doctorId && u.role === 'Doctor');
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found.' });
  }

  const patient = store.users.find(u => u.id === req.user.id);
  const patientName = patient ? patient.name : req.body.patientName || 'Guest Patient';
  const patientContact = patient ? patient.contact : req.body.patientContact || '';
  const patientAge = patient ? patient.age : 30;

  const sessionId = `tele_${Date.now()}`;
  const roomId = `room_${doctor.specialty ? doctor.specialty.toLowerCase().replace(/\s+/g, '_') : 'consult'}_${sessionId}`;

  const newSession = {
    id: sessionId,
    patientId: req.user.id,
    patientName,
    patientContact,
    patientAge,
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty || doctor.department || 'General Medicine',
    date,
    timeSlot,
    reason: reason || 'Telemedicine Video Consultation',
    status: 'Scheduled',
    roomId,
    videoUrl: `https://medinova.telehealth.live/${roomId}`,
    notes: '',
    prescription: [],
    createdAt: new Date().toISOString()
  };

  if (!store.telemedicineSessions) {
    store.telemedicineSessions = [];
  }

  store.telemedicineSessions.unshift(newSession);

  res.status(201).json({
    message: 'Telemedicine consultation scheduled successfully',
    session: newSession
  });
});

// PUT /api/telemedicine/sessions/:id/status (Update status: Scheduled, In-Progress, Completed, Cancelled)
router.put('/sessions/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const session = (store.telemedicineSessions || []).find(s => s.id === id);
  if (!session) {
    return res.status(404).json({ message: 'Telemedicine session not found.' });
  }

  session.status = status;
  if (status === 'Completed' && !session.completedAt) {
    session.completedAt = new Date().toISOString();
  }

  res.json({
    message: `Consultation status changed to ${status}`,
    session
  });
});

// POST /api/telemedicine/sessions/:id/complete (Doctor finishes consultation, creates prescriptions & writes to medical records)
router.post('/sessions/:id/complete', authenticateToken, authorizeRoles('Doctor', 'Admin'), (req, res) => {
  const { id } = req.params;
  const { notes, diagnosis, prescriptions } = req.body;

  const session = (store.telemedicineSessions || []).find(s => s.id === id);
  if (!session) {
    return res.status(404).json({ message: 'Telemedicine session not found.' });
  }

  session.status = 'Completed';
  session.notes = notes || session.notes || '';
  session.completedAt = new Date().toISOString();
  session.prescription = prescriptions || [];

  // Automatically create medical record entry linked to patient
  const newRecord = {
    id: `rec_${Date.now()}`,
    patientId: session.patientId,
    patientName: session.patientName,
    doctorId: session.doctorId,
    doctorName: session.doctorName,
    date: new Date().toISOString().split('T')[0],
    diagnosis: diagnosis || `Virtual Consultation: ${session.reason}`,
    symptoms: session.reason,
    prescriptions: prescriptions || [],
    labResults: 'Tele-consultation clinical assessment completed.',
    doctorNotes: notes || 'Virtual consultation conducted successfully.'
  };

  store.records.unshift(newRecord);

  // Update patient medical history
  const patientIdx = store.users.findIndex(u => u.id === session.patientId);
  if (patientIdx !== -1) {
    store.users[patientIdx].medicalHistory = `${store.users[patientIdx].medicalHistory || ''} [Tele-consult ${newRecord.date}]: ${newRecord.diagnosis}.`.trim();
  }

  res.json({
    message: 'Telemedicine consultation completed and recorded in electronic medical records',
    session,
    record: newRecord
  });
});

export default router;
