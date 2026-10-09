import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/patients/profile
router.get('/profile', authenticateToken, (req, res) => {
  const patient = store.users.find(u => u.id === req.user.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient profile not found.' });
  }
  const { password: _, ...profileData } = patient;
  res.json({ profile: profileData });
});

// PUT /api/patients/profile
router.put('/profile', authenticateToken, (req, res) => {
  const patientIndex = store.users.findIndex(u => u.id === req.user.id);
  if (patientIndex === -1) {
    return res.status(404).json({ message: 'Patient profile not found.' });
  }

  const { name, age, contact, bloodGroup, medicalHistory, emergencyContact, gender } = req.body;

  store.users[patientIndex] = {
    ...store.users[patientIndex],
    name: name || store.users[patientIndex].name,
    age: age ? parseInt(age) : store.users[patientIndex].age,
    contact: contact || store.users[patientIndex].contact,
    bloodGroup: bloodGroup || store.users[patientIndex].bloodGroup,
    medicalHistory: medicalHistory !== undefined ? medicalHistory : store.users[patientIndex].medicalHistory,
    emergencyContact: emergencyContact || store.users[patientIndex].emergencyContact,
    gender: gender || store.users[patientIndex].gender
  };

  const { password: _, ...updatedProfile } = store.users[patientIndex];
  res.json({ message: 'Profile updated successfully', profile: updatedProfile });
});

// GET /api/patients/all (For Doctors/Admins/Receptionists)
router.get('/all', authenticateToken, (req, res) => {
  const patients = store.users
    .filter(u => u.role === 'Patient')
    .map(({ password: _, ...p }) => p);
  res.json({ patients });
});

export default router;
