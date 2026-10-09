import express from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../db/store.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials. Please check your email and password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    message: 'Login successful',
    token,
    user: userWithoutPassword
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, name, role, age, gender, contact, bloodGroup, medicalHistory, specialty } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required.' });
  }

  const validRoles = ['Patient', 'Doctor', 'Receptionist', 'Ambulance Driver', 'Blood Bank Admin', 'Admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role specified. Must be one of: ${validRoles.join(', ')}` });
  }

  const existingUser = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: 'An account with this email address already exists.' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email,
    password,
    name,
    role,
    age: age ? parseInt(age) : 30,
    gender: gender || 'Unspecified',
    contact: contact || '+1 (555) 000-0000',
    bloodGroup: bloodGroup || 'O+',
    medicalHistory: medicalHistory || 'None declared.',
    specialty: specialty || (role === 'Doctor' ? 'General Medicine' : undefined)
  };

  store.users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: userWithoutPassword
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User profile not found.' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

export default router;
