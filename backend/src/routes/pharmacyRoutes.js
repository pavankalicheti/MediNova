import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate status
function getMedicineStatus(stock, reorderLevel) {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= Math.floor(reorderLevel * 0.5)) return 'Critical Low';
  if (stock <= reorderLevel) return 'Low Stock';
  return 'In Stock';
}

// GET /api/pharmacy/medicines (List all medicines with filters)
router.get('/medicines', authenticateToken, (req, res) => {
  const { category, search, status } = req.query;
  let items = [...(store.medicines || [])];

  if (category && category !== 'All') {
    items = items.filter(m => m.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (status && status !== 'All') {
    items = items.filter(m => m.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(q))
    );
  }

  // Count low stock alerts
  const lowStockCount = (store.medicines || []).filter(m => m.stock <= m.reorderLevel).length;
  const criticalLowCount = (store.medicines || []).filter(m => m.stock <= Math.floor(m.reorderLevel * 0.5)).length;

  res.json({
    medicines: items,
    summary: {
      totalMedicines: (store.medicines || []).length,
      lowStockCount,
      criticalLowCount,
      totalInventoryValuation: (store.medicines || []).reduce((acc, m) => acc + (m.stock * m.unitPrice), 0).toFixed(2)
    }
  });
});

// POST /api/pharmacy/medicines (Add new medicine)
router.post('/medicines', authenticateToken, authorizeRoles('Pharmacist', 'Admin', 'Doctor'), (req, res) => {
  const { name, category, dosage, form, stock, reorderLevel, unitPrice, expiryDate, manufacturer, description } = req.body;

  if (!name || !category || stock === undefined || !unitPrice) {
    return res.status(400).json({ message: 'Medicine name, category, stock, and unit price are required.' });
  }

  const stockNum = parseInt(stock, 10) || 0;
  const reorderNum = parseInt(reorderLevel, 10) || 50;
  const newMed = {
    id: `med_${Date.now()}`,
    name,
    category,
    dosage: dosage || 'Standard',
    form: form || 'Tablet',
    stock: stockNum,
    reorderLevel: reorderNum,
    unitPrice: parseFloat(unitPrice) || 10.0,
    expiryDate: expiryDate || '2028-01-01',
    manufacturer: manufacturer || 'MediNova Pharmaceuticals',
    status: getMedicineStatus(stockNum, reorderNum),
    description: description || ''
  };

  if (!store.medicines) store.medicines = [];
  store.medicines.unshift(newMed);

  // Log inventory transaction
  const user = store.users.find(u => u.id === req.user.id);
  const txn = {
    id: `txn_${Date.now()}`,
    type: 'RESTOCKED',
    medicineId: newMed.id,
    medicineName: newMed.name,
    quantity: stockNum,
    performedBy: user ? user.name : 'Authorized Staff',
    date: new Date().toISOString(),
    notes: 'Initial stock intake upon medicine registration.'
  };
  if (!store.pharmacyTransactions) store.pharmacyTransactions = [];
  store.pharmacyTransactions.unshift(txn);

  res.status(201).json({
    message: 'Medicine registered in pharmacy inventory successfully',
    medicine: newMed
  });
});

// PUT /api/pharmacy/medicines/:id/stock (Update / Restock stock)
router.put('/medicines/:id/stock', authenticateToken, authorizeRoles('Pharmacist', 'Admin', 'Doctor'), (req, res) => {
  const { id } = req.params;
  const { additionalStock, reason } = req.body;

  const med = (store.medicines || []).find(m => m.id === id);
  if (!med) {
    return res.status(404).json({ message: 'Medicine not found.' });
  }

  const addQty = parseInt(additionalStock, 10);
  if (isNaN(addQty)) {
    return res.status(400).json({ message: 'Valid stock quantity adjustment required.' });
  }

  med.stock = Math.max(0, med.stock + addQty);
  med.status = getMedicineStatus(med.stock, med.reorderLevel);

  // Log transaction
  const user = store.users.find(u => u.id === req.user.id);
  const txn = {
    id: `txn_${Date.now()}`,
    type: addQty >= 0 ? 'RESTOCKED' : 'MANUAL_ADJUSTMENT',
    medicineId: med.id,
    medicineName: med.name,
    quantity: Math.abs(addQty),
    performedBy: user ? user.name : 'Pharmacy Admin',
    date: new Date().toISOString(),
    notes: reason || (addQty >= 0 ? `Restocked by ${addQty} units.` : `Adjusted down by ${Math.abs(addQty)} units.`)
  };
  if (!store.pharmacyTransactions) store.pharmacyTransactions = [];
  store.pharmacyTransactions.unshift(txn);

  res.json({
    message: `Medicine stock updated. New balance: ${med.stock} units.`,
    medicine: med,
    transaction: txn
  });
});

// GET /api/pharmacy/prescriptions (Dispensing queue)
router.get('/prescriptions', authenticateToken, (req, res) => {
  // Extract all prescriptions from medical records
  const prescriptionsToDispense = [];

  (store.records || []).forEach(record => {
    if (record.prescriptions && Array.isArray(record.prescriptions)) {
      record.prescriptions.forEach((rx, idx) => {
        prescriptionsToDispense.push({
          dispenseId: `${record.id}_rx_${idx}`,
          recordId: record.id,
          patientId: record.patientId,
          patientName: record.patientName,
          doctorName: record.doctorName,
          date: record.date,
          diagnosis: record.diagnosis,
          prescription: rx,
          // Check if already dispensed
          isDispensed: (store.pharmacyTransactions || []).some(
            t => t.referencePrescriptionId === record.id && t.medicineName?.toLowerCase().includes(rx.name?.toLowerCase())
          )
        });
      });
    }
  });

  res.json({ prescriptions: prescriptionsToDispense });
});

// POST /api/pharmacy/dispense (Dispense prescription to patient)
router.post('/dispense', authenticateToken, authorizeRoles('Pharmacist', 'Admin', 'Doctor'), (req, res) => {
  const { recordId, medicineName, patientId, quantity = 30 } = req.body;

  if (!recordId || !medicineName) {
    return res.status(400).json({ message: 'Prescription record ID and medicine name are required.' });
  }

  // Find matching medicine in stock
  const med = (store.medicines || []).find(m =>
    m.name.toLowerCase().includes(medicineName.toLowerCase()) ||
    medicineName.toLowerCase().includes(m.name.toLowerCase())
  );

  const patient = store.users.find(u => u.id === patientId);
  const user = store.users.find(u => u.id === req.user.id);

  if (med) {
    med.stock = Math.max(0, med.stock - quantity);
    med.status = getMedicineStatus(med.stock, med.reorderLevel);
  }

  const txn = {
    id: `txn_${Date.now()}`,
    type: 'DISPENSED',
    medicineId: med ? med.id : 'med_custom',
    medicineName: med ? med.name : medicineName,
    quantity,
    patientId: patientId || 'usr_pat_1',
    patientName: patient ? patient.name : 'Sarah Jenkins',
    performedBy: user ? user.name : 'Elena Gilbert, PharmD',
    referencePrescriptionId: recordId,
    date: new Date().toISOString(),
    notes: `Prescription dispensed per clinical record #${recordId}.`
  };

  if (!store.pharmacyTransactions) store.pharmacyTransactions = [];
  store.pharmacyTransactions.unshift(txn);

  res.json({
    message: `Prescription for ${medicineName} successfully dispensed to ${txn.patientName}. Inventory stock deducted.`,
    transaction: txn,
    updatedMedicine: med
  });
});

// GET /api/pharmacy/transactions (Audit log)
router.get('/transactions', authenticateToken, (req, res) => {
  res.json({ transactions: store.pharmacyTransactions || [] });
});

// GET /api/pharmacy/orders (Patient or Pharmacist order history)
router.get('/orders', authenticateToken, (req, res) => {
  const { role, id } = req.user;

  if (role === 'Patient') {
    const orders = (store.pharmacyOrders || []).filter(o => o.patientId === id);
    return res.json({ orders });
  }

  res.json({ orders: store.pharmacyOrders || [] });
});

// POST /api/pharmacy/orders (Patient medicine checkout)
router.post('/orders', authenticateToken, (req, res) => {
  const { items, deliveryAddress } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ message: 'Cart items are required.' });
  }

  const patient = store.users.find(u => u.id === req.user.id);
  const patientName = patient ? patient.name : 'Patient';

  let totalAmount = 0;
  const processedItems = [];

  // Deduct inventory stock for each purchased item
  items.forEach(cartItem => {
    const med = (store.medicines || []).find(m => m.id === cartItem.medicineId);
    const qty = parseInt(cartItem.quantity, 10) || 1;
    const price = med ? med.unitPrice : (cartItem.unitPrice || 10);
    totalAmount += price * qty;

    if (med) {
      med.stock = Math.max(0, med.stock - qty);
      med.status = getMedicineStatus(med.stock, med.reorderLevel);

      // Log transaction
      const txn = {
        id: `txn_${Date.now()}_${med.id}`,
        type: 'PATIENT_PURCHASE',
        medicineId: med.id,
        medicineName: med.name,
        quantity: qty,
        patientId: req.user.id,
        patientName,
        performedBy: 'Online Patient Store Checkout',
        date: new Date().toISOString(),
        notes: `Direct purchase order by patient ${patientName}.`
      };
      if (!store.pharmacyTransactions) store.pharmacyTransactions = [];
      store.pharmacyTransactions.unshift(txn);
    }

    processedItems.push({
      medicineId: cartItem.medicineId,
      name: med ? med.name : cartItem.name,
      quantity: qty,
      unitPrice: price
    });
  });

  const orderId = `ord_${Date.now()}`;
  const newOrder = {
    id: orderId,
    patientId: req.user.id,
    patientName,
    items: processedItems,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    status: 'Confirmed & In Transit',
    paymentStatus: 'Paid (Digital Healthcare Wallet)',
    deliveryAddress: deliveryAddress || 'Registered Home Address',
    createdAt: new Date().toISOString()
  };

  if (!store.pharmacyOrders) store.pharmacyOrders = [];
  store.pharmacyOrders.unshift(newOrder);

  res.status(201).json({
    message: 'Medicine order placed and paid successfully. Inventory updated.',
    order: newOrder
  });
});

export default router;
