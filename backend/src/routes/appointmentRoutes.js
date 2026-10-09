import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/appointments
router.get('/', authenticateToken, (req, res) => {
  const { role, id } = req.user;

  if (role === 'Patient') {
    const userApts = store.appointments.filter(a => a.patientId === id);
    return res.json({ appointments: userApts });
  }

  if (role === 'Doctor') {
    const docApts = store.appointments.filter(a => a.doctorId === id);
    return res.json({ appointments: docApts });
  }

  // Receptionist & Admin see all
  res.json({ appointments: store.appointments });
});

// GET /api/appointments/doctors (List all doctors & their specialties/slots)
router.get('/doctors', authenticateToken, (req, res) => {
  const doctors = store.users
    .filter(u => u.role === 'Doctor')
    .map(({ password: _, ...doc }) => doc);
  res.json({ doctors });
});

// POST /api/appointments (Book Appointment)
router.post('/', authenticateToken, (req, res) => {
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

  const newAppointment = {
    id: `apt_${Date.now()}`,
    patientId: req.user.id,
    patientName,
    doctorId: doctor.id,
    doctorName: doctor.name,
    department: doctor.department || doctor.specialty || 'General Care',
    date,
    timeSlot,
    reason: reason || 'General Consultation',
    status: 'Booked',
    createdAt: new Date().toISOString()
  };

  store.appointments.unshift(newAppointment);

  res.status(201).json({
    message: 'Appointment booked successfully',
    appointment: newAppointment
  });
});

// PUT /api/appointments/:id/status (Update appointment status)
router.put('/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Booked', 'Confirmed', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });
  }

  const aptIndex = store.appointments.findIndex(a => a.id === id);
  if (aptIndex === -1) {
    return res.status(404).json({ message: 'Appointment not found.' });
  }

  store.appointments[aptIndex].status = status;

  res.json({
    message: `Appointment status updated to ${status}`,
    appointment: store.appointments[aptIndex]
  });
});

export default router;
