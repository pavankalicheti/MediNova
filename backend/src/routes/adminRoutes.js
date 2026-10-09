import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/stats (System-wide statistics)
router.get('/stats', authenticateToken, authorizeRoles('Admin', 'Receptionist', 'Doctor'), (req, res) => {
  const totalPatients = store.users.filter(u => u.role === 'Patient').length;
  const totalDoctors = store.users.filter(u => u.role === 'Doctor').length;
  const totalStaff = store.users.filter(u => u.role !== 'Patient' && u.role !== 'Doctor').length;
  
  const totalAppointments = store.appointments.length;
  const pendingAppointments = store.appointments.filter(a => a.status === 'Booked').length;

  const criticalTriage = store.triageQueue.filter(t => t.priorityResult && t.priorityResult.priority === 'Critical').length;
  const activeEmergencies = store.triageQueue.filter(t => t.status === 'Active ER Queue').length;

  const activeAmbulanceRequests = store.ambulanceRequests.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled').length;
  
  const lowBloodStockCount = store.bloodInventory.filter(i => i.units <= i.minThreshold).length;

  res.json({
    stats: {
      totalPatients,
      totalDoctors,
      totalStaff,
      totalAppointments,
      pendingAppointments,
      criticalTriage,
      activeEmergencies,
      activeAmbulanceRequests,
      lowBloodStockCount
    }
  });
});

// GET /api/admin/users (List all system users)
router.get('/users', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  const usersWithoutPassword = store.users.map(({ password: _, ...user }) => user);
  res.json({ users: usersWithoutPassword });
});

// POST /api/admin/users (Add new staff or doctor)
router.post('/users', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  const { name, email, password, role, specialty, department, contact } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required.' });
  }

  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'User with this email already exists.' });
  }

  const newUser = {
    id: `usr_adm_add_${Date.now()}`,
    name,
    email,
    password,
    role,
    specialty,
    department: department || 'General Staff',
    contact: contact || '+1 (555) 000-0000',
    availableSlots: role === 'Doctor' ? ['09:00 AM', '11:00 AM', '02:00 PM'] : undefined
  };

  store.users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    message: `User '${name}' created successfully with role '${role}'`,
    user: userWithoutPassword
  });
});

// DELETE /api/admin/users/:id (Remove a staff member or user)
router.delete('/users/:id', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own admin account while logged in.' });
  }

  const index = store.users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const deletedUser = store.users.splice(index, 1)[0];

  res.json({
    message: `User '${deletedUser.name}' was successfully deleted.`
  });
});

export default router;
