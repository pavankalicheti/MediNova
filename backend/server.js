import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './src/routes/authRoutes.js';
import patientRoutes from './src/routes/patientRoutes.js';
import recordRoutes from './src/routes/recordRoutes.js';
import appointmentRoutes from './src/routes/appointmentRoutes.js';
import triageRoutes from './src/routes/triageRoutes.js';
import ambulanceRoutes from './src/routes/ambulanceRoutes.js';
import bloodBankRoutes from './src/routes/bloodBankRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/bloodbank', bloodBankRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'MediNova AI Healthcare Management System',
    timestamp: new Date().toISOString()
  });
});

// Root fallback
app.get('/', (req, res) => {
  res.send('MediNova Backend API Service is running.');
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` MediNova Healthcare Backend running on port ${PORT}`);
  console.log(` API base endpoint: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
