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
import telemedicineRoutes from './src/routes/telemedicineRoutes.js';
import pharmacyRoutes from './src/routes/pharmacyRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import iotRoutes from './src/routes/iotRoutes.js';
import emrExchangeRoutes from './src/routes/emrExchangeRoutes.js';
import genomicsRoutes from './src/routes/genomicsRoutes.js';
import roboticSurgeryRoutes from './src/routes/roboticSurgeryRoutes.js';
import quantumTelemetryRoutes from './src/routes/quantumTelemetryRoutes.js';
import droneDispatchRoutes from './src/routes/droneDispatchRoutes.js';
import imagingRoutes from './src/routes/imagingRoutes.js';
import voiceAssistantRoutes from './src/routes/voiceAssistantRoutes.js';
import multilingualRoutes from './src/routes/multilingualRoutes.js';
import bedManagementRoutes from './src/routes/bedManagementRoutes.js';
import insuranceRoutes from './src/routes/insuranceRoutes.js';
import biotechRoutes from './src/routes/biotechRoutes.js';
import bioPrintingRoutes from './src/routes/bioPrintingRoutes.js';
import spaceTelemetryRoutes from './src/routes/spaceTelemetryRoutes.js';

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
app.use('/api/telemedicine', telemedicineRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/emr-exchange', emrExchangeRoutes);
app.use('/api/genomics', genomicsRoutes);
app.use('/api/robotic-surgery', roboticSurgeryRoutes);
app.use('/api/quantum', quantumTelemetryRoutes);
app.use('/api/drones', droneDispatchRoutes);
app.use('/api/imaging', imagingRoutes);
app.use('/api/voice', voiceAssistantRoutes);
app.use('/api/multilingual', multilingualRoutes);
app.use('/api/beds', bedManagementRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/biotech', biotechRoutes);
app.use('/api/bioprinting', bioPrintingRoutes);
app.use('/api/space-telemetry', spaceTelemetryRoutes);

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
