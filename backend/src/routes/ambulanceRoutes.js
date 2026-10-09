import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/ambulances (List active ambulance requests & available drivers)
router.get('/', authenticateToken, (req, res) => {
  const drivers = store.users
    .filter(u => u.role === 'Ambulance Driver')
    .map(({ password: _, ...d }) => d);

  res.json({
    requests: store.ambulanceRequests,
    drivers
  });
});

// POST /api/ambulances/request (Request an emergency ambulance)
router.post('/request', authenticateToken, (req, res) => {
  const { pickupLocation, latitude, longitude, notes } = req.body;

  if (!pickupLocation) {
    return res.status(400).json({ message: 'Pickup location address is required.' });
  }

  // Find nearest available driver
  const availableDriver = store.users.find(u => u.role === 'Ambulance Driver' && u.status === 'Available') 
    || store.users.find(u => u.role === 'Ambulance Driver');

  const patientName = req.user ? req.user.name : req.body.patientName || 'Emergency Patient';
  const contact = req.user ? req.user.contact : req.body.contact || '+1 (555) 911-0000';

  const newRequest = {
    id: `amb_req_${Date.now()}`,
    patientId: req.user ? req.user.id : null,
    patientName,
    contact,
    pickupLocation,
    latitude: latitude || 40.7128 + (Math.random() - 0.5) * 0.05,
    longitude: longitude || -74.0060 + (Math.random() - 0.5) * 0.05,
    driverId: availableDriver ? availableDriver.id : 'usr_drv_1',
    driverName: availableDriver ? availableDriver.name : 'Robert Taylor',
    vehicleNumber: availableDriver ? availableDriver.vehicleNumber : 'AMB-9021',
    status: 'Assigned',
    notes: notes || 'Emergency dispatch initiated',
    requestedAt: new Date().toISOString(),
    progress: 10 // 10% progress towards destination
  };

  if (availableDriver) {
    availableDriver.status = 'Dispatched';
  }

  store.ambulanceRequests.unshift(newRequest);

  res.status(201).json({
    message: 'Ambulance dispatched successfully',
    request: newRequest
  });
});

// PUT /api/ambulances/status (Driver updates trip status and simulated location progress)
router.put('/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, progress } = req.body;

  const validStatuses = ['Assigned', 'En route', 'Arrived', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });
  }

  const reqIndex = store.ambulanceRequests.findIndex(r => r.id === id);
  if (reqIndex === -1) {
    return res.status(404).json({ message: 'Ambulance request not found.' });
  }

  const currentReq = store.ambulanceRequests[reqIndex];
  currentReq.status = status;

  if (progress !== undefined) {
    currentReq.progress = Math.min(Math.max(parseFloat(progress), 0), 100);
  } else {
    if (status === 'Assigned') currentReq.progress = 15;
    if (status === 'En route') currentReq.progress = 60;
    if (status === 'Arrived') currentReq.progress = 90;
    if (status === 'Completed') currentReq.progress = 100;
  }

  // If completed, free up driver
  if (status === 'Completed') {
    const driverIndex = store.users.findIndex(u => u.id === currentReq.driverId);
    if (driverIndex !== -1) {
      store.users[driverIndex].status = 'Available';
    }
  }

  res.json({
    message: `Ambulance trip status updated to ${status}`,
    request: currentReq
  });
});

export default router;
