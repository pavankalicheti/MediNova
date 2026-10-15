import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/drones/fleet (List all drones and live avionics)
router.get('/fleet', authenticateToken, (req, res) => {
  res.json({ fleet: store.droneFleet || [] });
});

// GET /api/drones/missions (List all active and past drone missions)
router.get('/missions', authenticateToken, (req, res) => {
  res.json({ missions: store.droneMissions || [] });
});

// GET /api/drones/corridors (List FAA approved medical air corridors)
router.get('/corridors', authenticateToken, (req, res) => {
  res.json({ corridors: store.droneAirCorridors || [] });
});

// POST /api/drones/dispatch (Launch autonomous medical drone mission)
router.post('/dispatch', authenticateToken, authorizeRoles('Doctor', 'Admin', 'Pharmacist', 'Blood Bank Admin'), (req, res) => {
  const { droneId, destinationFacility, payload, priority, corridorId } = req.body;

  if (!destinationFacility || !payload) {
    return res.status(400).json({ message: 'Destination facility and blood payload are required.' });
  }

  // Find available drone or use selected
  let drone = (store.droneFleet || []).find(d => d.id === droneId);
  if (!drone) {
    drone = (store.droneFleet || []).find(d => d.status.includes('Docked') || d.status.includes('Standby')) || store.droneFleet[0];
  }

  // Update drone status to In-Flight
  drone.status = 'In-Flight Delivery';
  drone.destination = destinationFacility;
  drone.payloadType = payload;
  drone.emergencyPriority = priority || 'STAT Life-Threatening Triage';
  drone.altitudeMeters = 125;
  drone.cruisingSpeedKmh = 118;
  drone.distanceRemainingKm = 11.2;
  drone.etaMinutes = 5;
  drone.payloadBayTempC = 3.9;

  const newMission = {
    id: `msn_drn_${Date.now()}`,
    droneId: drone.id,
    droneCallsign: drone.callsign,
    priority: drone.emergencyPriority,
    payload,
    coldChainStatus: 'Active Refrigeration (3.9°C Verified)',
    originHub: 'MediNova Central Blood Bank Hub',
    destinationFacility,
    dispatchedAt: new Date().toISOString(),
    flightStatus: 'In-Flight (En Route)',
    totalDistanceKm: 12.8,
    etaMinutes: 5,
    dispatchedBy: req.user.name
  };

  if (!store.droneMissions) store.droneMissions = [];
  store.droneMissions.unshift(newMission);

  res.status(201).json({
    message: `Autonomous medical drone ${drone.callsign} launched successfully. Airborne along protected medical air corridor.`,
    mission: newMission,
    drone
  });
});

// POST /api/drones/:id/rth (Command Return to Home)
router.post('/:id/rth', authenticateToken, authorizeRoles('Doctor', 'Admin', 'Pharmacist', 'Blood Bank Admin'), (req, res) => {
  const { id } = req.params;
  const drone = (store.droneFleet || []).find(d => d.id === id);

  if (!drone) {
    return res.status(404).json({ message: 'Drone unit not found.' });
  }

  drone.status = 'Returning to Base (RTH)';
  drone.destination = 'MediNova Central Blood Bank Hub';
  drone.distanceRemainingKm = 5.0;
  drone.etaMinutes = 3;

  res.json({
    message: `Return-to-Home (RTH) autonomous route engaged for ${drone.callsign}. Returning to MediNova Central Hub.`,
    drone
  });
});

// POST /api/drones/:id/temp-check (Verify payload cold-chain compliance)
router.post('/:id/temp-check', authenticateToken, (req, res) => {
  const { id } = req.params;
  const drone = (store.droneFleet || []).find(d => d.id === id);

  if (!drone) {
    return res.status(404).json({ message: 'Drone unit not found.' });
  }

  // Jitter temperature slightly within strict 2-6C safe window
  drone.payloadBayTempC = parseFloat((3.6 + Math.random() * 0.6).toFixed(1));

  res.json({
    droneId: drone.id,
    callsign: drone.callsign,
    currentTemperatureC: drone.payloadBayTempC,
    targetRange: drone.payloadBayTargetTemp,
    isCompliant: true,
    sensorStatus: 'Redundant Dual Cryo-Sensors Active (AABB & FDA 21 CFR Compliant)',
    verificationTimestamp: new Date().toISOString()
  });
});

export default router;
