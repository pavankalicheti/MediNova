import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Compatibility map for blood group matching
const COMPATIBILITY_MAP = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
};

// GET /api/bloodbank/inventory (Get current stock levels & low stock alerts)
router.get('/inventory', authenticateToken, (req, res) => {
  const lowStockAlerts = store.bloodInventory.filter(item => item.units <= item.minThreshold);
  res.json({
    inventory: store.bloodInventory,
    lowStockAlerts
  });
});

// PUT /api/bloodbank/inventory (Update blood inventory units)
router.put('/inventory', authenticateToken, (req, res) => {
  const { bloodGroup, units } = req.body;

  if (!bloodGroup || units === undefined) {
    return res.status(400).json({ message: 'Blood group and unit count are required.' });
  }

  const itemIndex = store.bloodInventory.findIndex(i => i.bloodGroup.toUpperCase() === bloodGroup.toUpperCase());
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Blood group not found in inventory record.' });
  }

  const numUnits = parseInt(units);
  const minThreshold = store.bloodInventory[itemIndex].minThreshold;

  let status = 'Normal';
  if (numUnits <= 3) status = 'Critical Low';
  else if (numUnits <= minThreshold) status = 'Low Stock';

  store.bloodInventory[itemIndex].units = numUnits;
  store.bloodInventory[itemIndex].status = status;

  res.json({
    message: `Updated ${bloodGroup} stock to ${numUnits} units`,
    item: store.bloodInventory[itemIndex]
  });
});

// GET /api/bloodbank/donors (List all donors)
router.get('/donors', authenticateToken, (req, res) => {
  res.json({ donors: store.bloodDonors });
});

// POST /api/bloodbank/donors (Register a new donor)
router.post('/donors', authenticateToken, (req, res) => {
  const { name, bloodGroup, age, contact, city, isAvailable } = req.body;

  if (!name || !bloodGroup || !contact) {
    return res.status(400).json({ message: 'Name, blood group, and contact number are required.' });
  }

  const newDonor = {
    id: `dnr_${Date.now()}`,
    name,
    bloodGroup: bloodGroup.toUpperCase(),
    age: parseInt(age) || 28,
    contact,
    city: city || 'City Center (3.0 km away)',
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    lastDonated: new Date().toISOString().split('T')[0]
  };

  store.bloodDonors.unshift(newDonor);

  res.status(201).json({
    message: 'Donor registered successfully',
    donor: newDonor
  });
});

// GET /api/bloodbank/match?bloodGroup=... (Match compatible donors for patient)
router.get('/match', authenticateToken, (req, res) => {
  const { bloodGroup } = req.query;

  if (!bloodGroup) {
    return res.status(400).json({ message: 'Target patient bloodGroup query param is required.' });
  }

  const bgUpper = bloodGroup.toUpperCase();
  const compatibleGroups = COMPATIBILITY_MAP[bgUpper] || [bgUpper];

  const matchedDonors = store.bloodDonors.filter(donor => 
    donor.isAvailable && compatibleGroups.includes(donor.bloodGroup)
  );

  const inventoryItem = store.bloodInventory.find(i => i.bloodGroup.toUpperCase() === bgUpper);

  res.json({
    requestedBloodGroup: bgUpper,
    compatibleGroups,
    matchedDonors,
    inventoryStock: inventoryItem ? inventoryItem.units : 0,
    isStockLow: inventoryItem ? inventoryItem.units <= inventoryItem.minThreshold : false
  });
});

export default router;
