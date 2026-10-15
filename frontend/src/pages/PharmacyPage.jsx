import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Pill,
  Search,
  Plus,
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  FileText,
  Clock,
  ArrowUpDown,
  DollarSign,
  PackageCheck,
  Truck,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';

export default function PharmacyPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === 'Patient' ? 'store' : 'inventory'
  ); // 'inventory', 'store', 'dispense', 'orders', 'transactions'

  // Data states
  const [medicines, setMedicines] = useState([]);
  const [summary, setSummary] = useState({ totalMedicines: 0, lowStockCount: 0, criticalLowCount: 0, totalInventoryValuation: '0.00' });
  const [prescriptions, setPrescriptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMedData, setNewMedData] = useState({
    name: '',
    category: 'Cardiovascular',
    dosage: '20mg',
    form: 'Tablet',
    stock: 100,
    reorderLevel: 50,
    unitPrice: 15.00,
    expiryDate: '2027-12-31',
    manufacturer: '',
    description: ''
  });

  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState(50);
  const [restockReason, setRestockReason] = useState('Routine batch restock');

  // Patient Shopping Cart State
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.role === 'Patient' ? '124 Maple Street, Apt 4B, Central City' : ''
  );
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');

  const isStaff = user?.role === 'Pharmacist' || user?.role === 'Admin' || user?.role === 'Doctor';

  const categories = [
    'All',
    'Cardiovascular',
    'Diabetes Care',
    'Antibiotics',
    'Respiratory',
    'Emergency Medicine',
    'Analgesics & Fever',
    'Neurology & Pain'
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [medRes, rxRes, txnRes, orderRes] = await Promise.all([
        api.getMedicines({ category: selectedCategory !== 'All' ? selectedCategory : '', search: searchQuery }),
        api.getPrescriptionsToDispense(),
        api.getPharmacyTransactions(),
        api.getPharmacyOrders()
      ]);
      setMedicines(medRes.medicines || []);
      setSummary(medRes.summary || { totalMedicines: 0, lowStockCount: 0, criticalLowCount: 0, totalInventoryValuation: '0.00' });
      setPrescriptions(rxRes.prescriptions || []);
      setTransactions(txnRes.transactions || []);
      setOrders(orderRes.orders || []);
    } catch (err) {
      console.error('Failed to load pharmacy data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  // Handle Add Medicine
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.addMedicine(newMedData);
      setIsAddModalOpen(false);
      setNewMedData({
        name: '',
        category: 'Cardiovascular',
        dosage: '20mg',
        form: 'Tablet',
        stock: 100,
        reorderLevel: 50,
        unitPrice: 15.00,
        expiryDate: '2027-12-31',
        manufacturer: '',
        description: ''
      });
      await loadData();
    } catch (err) {
      alert('Failed to add medicine: ' + err.message);
    }
  };

  // Handle Restock
  const handleRestock = async (e) => {
    e.preventDefault();
    if (!restockItem) return;
    try {
      await api.updateMedicineStock(restockItem.id, restockAmount, restockReason);
      setRestockItem(null);
      await loadData();
    } catch (err) {
      alert('Failed to restock: ' + err.message);
    }
  };

  // Handle Dispense Prescription
  const handleDispenseRx = async (rxItem) => {
    try {
      await api.dispensePrescription({
        recordId: rxItem.recordId,
        medicineName: rxItem.prescription.name,
        patientId: rxItem.patientId,
        patientName: rxItem.patientName,
        quantity: 30
      });
      alert(`Prescription for ${rxItem.prescription.name} dispensed successfully. Stock deducted.`);
      await loadData();
    } catch (err) {
      alert('Failed to dispense: ' + err.message);
    }
  };

  // Cart Management for Store
  const addToCart = (med) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.medicineId === med.id);
      if (existing) {
        return prev.map((item) =>
          item.medicineId === med.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          medicineId: med.id,
          name: med.name,
          category: med.category,
          unitPrice: med.unitPrice,
          dosage: med.dosage,
          quantity: 1
        }
      ];
    });
  };

  const updateCartQty = (medId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.medicineId === medId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (medId) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Handle Place Order
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    try {
      setOrderSubmitting(true);
      await api.createPharmacyOrder({
        items: cart,
        deliveryAddress
      });
      setCart([]);
      setOrderSuccessMsg('Order placed and paid successfully! Pharmacy dispatch in transit.');
      setTimeout(() => setOrderSuccessMsg(''), 4000);
      await loadData();
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Pill className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold font-outfit text-slate-800">Pharmacy & Medicine Store</h1>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              Live Inventory & Dispensary
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Real-time pharmaceutical inventory, prescription dispensing queue, automatic low-stock alerts, and online patient medicine store.
          </p>
        </div>

        {isStaff && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Medicine</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Catalog Inventory</div>
          <div className="text-2xl font-bold font-outfit text-slate-800 mt-1">{summary.totalMedicines} Items</div>
          <div className="text-[11px] text-blue-600 mt-0.5 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Active Formulations</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Low Stock Alerts</div>
          <div className="text-2xl font-bold font-outfit text-blue-700 mt-1">{summary.lowStockCount} Meds</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-blue-500" />
            <span>Under Reorder Level</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Critical Depletion</div>
          <div className="text-2xl font-bold font-outfit text-slate-900 mt-1">{summary.criticalLowCount} Meds</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>&lt; 50% Threshold</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Inventory Value</div>
          <div className="text-2xl font-bold font-outfit text-slate-800 mt-1">${summary.totalInventoryValuation}</div>
          <div className="text-[11px] text-blue-600 mt-0.5 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>Total Valuation</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center gap-2">
          {isStaff && (
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Inventory Management ({medicines.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('store')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'store'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Patient Medicine Store</span>
            {cart.length > 0 && (
              <span className="bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {cart.length}
              </span>
            )}
          </button>

          {isStaff && (
            <button
              onClick={() => setActiveTab('dispense')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'dispense'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Prescription Dispensing ({prescriptions.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Orders & Delivery ({orders.length})</span>
          </button>

          {isStaff && (
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'transactions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Log ({transactions.length})</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search medicine, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none w-56 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SUCCESS NOTIFICATION */}
      {orderSuccessMsg && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{orderSuccessMsg}</span>
        </div>
      )}

      {/* 1. INVENTORY MANAGEMENT TAB (Staff View) */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Medicine Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Dosage / Form</th>
                  <th className="p-3.5">Stock Level</th>
                  <th className="p-3.5">Unit Price</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((med) => {
                  const isLow = med.stock <= med.reorderLevel;
                  const isCritical = med.stock <= Math.floor(med.reorderLevel * 0.5);
                  return (
                    <tr key={med.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{med.name}</div>
                        <div className="text-[11px] text-slate-400">{med.manufacturer}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-100">
                          {med.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono">
                        {med.dosage} • {med.form}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold font-mono text-slate-800">{med.stock} units</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">(Reorder: {med.reorderLevel})</span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700 font-mono">
                        ${med.unitPrice.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono">
                        {med.expiryDate}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCritical
                              ? 'bg-blue-100 text-blue-800 border border-blue-400'
                              : isLow
                              ? 'bg-sky-50 text-sky-800 border border-sky-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {med.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setRestockItem(med);
                            setRestockAmount(50);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs border border-blue-200 transition"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PATIENT MEDICINE STORE TAB (Patient Online Pharmacy) */}
      {activeTab === 'store' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Medicine Catalog Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {medicines.map((med) => {
                const inCart = cart.find((c) => c.medicineId === med.id);
                return (
                  <div
                    key={med.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-300 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-semibold">
                          {med.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          ${med.unitPrice.toFixed(2)}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 font-outfit text-sm">{med.name}</h3>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {med.dosage} • {med.form}
                      </div>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {med.description || 'Verified pharmaceutical grade medication.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {med.stock > 0 ? `${med.stock} in stock` : 'Out of Stock'}
                      </span>

                      {inCart ? (
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                          <button
                            onClick={() => updateCartQty(med.id, -1)}
                            className="text-blue-700 font-bold px-1 hover:bg-blue-100 rounded"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-blue-800">{inCart.quantity}</span>
                          <button
                            onClick={() => updateCartQty(med.id, 1)}
                            className="text-blue-700 font-bold px-1 hover:bg-blue-100 rounded"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(med)}
                          disabled={med.stock <= 0}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Shopping Cart & Itemized Bill (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-md sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 font-outfit">Medicine Cart</h3>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {cart.length} items
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Your cart is empty. Select medicines from the catalog to build an order.
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.medicineId}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                      >
                        <div className="overflow-hidden mr-2">
                          <div className="font-bold text-slate-800 truncate">{item.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ${item.unitPrice.toFixed(2)} × {item.quantity} = ${(item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.medicineId)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Address / Ward Bed #
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. 124 Maple Street or Room 402"
                      required
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Itemized Cost Summary */}
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Dispensary &amp; Packaging</span>
                      <span className="font-mono">$0.00 (Waived)</span>
                    </div>
                    <div className="pt-2 border-t border-blue-200 flex justify-between font-bold text-blue-900 text-sm">
                      <span>Total Due</span>
                      <span className="font-mono">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{orderSubmitting ? 'Processing Payment...' : 'Instant Checkout & Pay'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    Authorized digital transaction with automated invoice receipt.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. PRESCRIPTION DISPENSING QUEUE TAB */}
      {activeTab === 'dispense' && isStaff && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 font-outfit text-sm">Doctor Prescription Dispensing Queue</h3>
              <p className="text-xs text-slate-500">Authorized pharmacists verify and dispense doctor-prescribed medications.</p>
            </div>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
              Verified Queue
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {prescriptions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No pending prescriptions found.</div>
            ) : (
              prescriptions.map((rxItem) => (
                <div key={rxItem.dispenseId} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-sm">{rxItem.prescription.name}</span>
                      <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                        {rxItem.prescription.dosage || 'Standard'}
                      </span>
                      {rxItem.isDispensed ? (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          Dispensed
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold animate-pulse">
                          Pending Dispensing
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      Patient: <strong className="text-slate-700">{rxItem.patientName}</strong> • Prescribed by: <strong className="text-slate-700">{rxItem.doctorName}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Diagnosis: {rxItem.diagnosis} • Frequency: {rxItem.prescription.frequency}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rxItem.isDispensed ? (
                      <span className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span>Dispensed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDispenseRx(rxItem)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Dispense &amp; Deduct Stock</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. ORDERS & DELIVERIES TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 font-outfit text-sm">Pharmacy Order Fulfillment &amp; Receipts</h3>
            <span className="text-xs text-slate-500">{orders.length} Orders Recorded</span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No orders placed yet.</div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="p-4 hover:bg-slate-50 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-700">{ord.id}</span>
                      <span className="text-xs text-slate-600 font-semibold">• {ord.patientName}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                        {ord.status}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-800">
                      ${ord.totalAmount?.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4">
                    <span>Address: <strong>{ord.deliveryAddress}</strong></span>
                    <span>Payment: <strong className="text-blue-700">{ord.paymentStatus}</strong></span>
                    <span>Ordered: {new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Items list */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {ord.items?.map((it, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-1 rounded-lg border border-slate-200">
                        {it.name} (×{it.quantity})
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. INVENTORY TRANSACTION AUDIT LOG TAB */}
      {activeTab === 'transactions' && isStaff && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 font-outfit text-sm">Medicine Inventory Transaction Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger tracking restock, dispensing, and patient orders.</p>
            </div>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-bold">
              Audit Trail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Medicine</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Performed By / Patient</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition font-sans">
                    <td className="p-3.5 font-mono text-blue-700 font-semibold">{tx.id}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'RESTOCKED'
                            ? 'bg-blue-100 text-blue-800'
                            : tx.type === 'DISPENSED'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{tx.medicineName}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-700">
                      {tx.type === 'RESTOCKED' ? `+${tx.quantity}` : `-${tx.quantity}`}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {tx.performedBy} {tx.patientName ? `(${tx.patientName})` : ''}
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-500 italic text-[11px]">{tx.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Medicine */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <span>Register New Pharmaceutical Item</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Add a new drug formulation to the MediNova central inventory.</p>

            <form onSubmit={handleAddMedicine} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ciprofloxacin Hydrochloride"
                  value={newMedData.name}
                  onChange={(e) => setNewMedData({ ...newMedData, name: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newMedData.category}
                    onChange={(e) => setNewMedData({ ...newMedData, category: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosage / Strength</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={newMedData.dosage}
                    onChange={(e) => setNewMedData({ ...newMedData, dosage: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newMedData.stock}
                    onChange={(e) => setNewMedData({ ...newMedData, stock: e.target.value })}
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={newMedData.reorderLevel}
                    onChange={(e) => setNewMedData({ ...newMedData, reorderLevel: e.target.value })}
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMedData.unitPrice}
                    onChange={(e) => setNewMedData({ ...newMedData, unitPrice: e.target.value })}
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newMedData.expiryDate}
                    onChange={(e) => setNewMedData({ ...newMedData, expiryDate: e.target.value })}
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Pfizer, Novartis"
                    value={newMedData.manufacturer}
                    onChange={(e) => setNewMedData({ ...newMedData, manufacturer: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Restock Medicine */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-1 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-blue-600" />
              <span>Restock Medicine</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Restocking: <strong className="text-slate-800">{restockItem.name}</strong> (Current Stock: {restockItem.stock})
            </p>

            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Units to Add</label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value, 10))}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Restock Reason / Batch Reference</label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
