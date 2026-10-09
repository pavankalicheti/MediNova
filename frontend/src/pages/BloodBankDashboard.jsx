import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Droplet, AlertTriangle, Plus, Search, User, Phone, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';

export default function BloodBankDashboard() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [lowAlerts, setLowAlerts] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Donor Search State
  const [searchBloodGroup, setSearchBloodGroup] = useState('O-');
  const [matchResult, setMatchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  // New Donor Registration Modal State
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [donorForm, setDonorForm] = useState({
    name: '',
    bloodGroup: 'O-',
    age: '28',
    contact: '',
    city: 'Central Plaza (2.0 km away)',
    isAvailable: true
  });

  const fetchData = async () => {
    try {
      const [invRes, dnrRes] = await Promise.all([
        api.getBloodInventory(),
        api.getDonors()
      ]);
      setInventory(invRes.inventory || []);
      setLowAlerts(invRes.lowStockAlerts || []);
      setDonors(dnrRes.donors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchMatch = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const res = await api.matchDonors(searchBloodGroup);
      setMatchResult(res);
    } catch (err) {
      alert('Error searching compatible donors: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleUpdateStock = async (bloodGroup, currentUnits, delta) => {
    const newUnits = Math.max(0, currentUnits + delta);
    try {
      await api.updateBloodInventory(bloodGroup, newUnits);
      fetchData();
    } catch (err) {
      alert('Error updating stock: ' + err.message);
    }
  };

  const handleDonorRegister = async (e) => {
    e.preventDefault();
    try {
      await api.registerDonor(donorForm);
      setShowDonorModal(false);
      setDonorForm({
        name: '',
        bloodGroup: 'O-',
        age: '28',
        contact: '',
        city: 'Central Plaza (2.0 km away)',
        isAvailable: true
      });
      fetchData();
    } catch (err) {
      alert('Error registering donor: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-2">
            <Droplet className="w-3.5 h-3.5" />
            <span>Blood Bank & Donor Compatibility Engine (Phase B)</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-outfit">Blood Bank Inventory & Donor Matcher</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time blood group stock levels, flag low-unit alerts, and execute recipient-donor compatibility algorithms.
          </p>
        </div>

        <button
          onClick={() => setShowDonorModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Register Voluntary Blood Donor
        </button>
      </div>

      {/* Low Stock Warning Banner */}
      {lowAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-4 shadow-lg shadow-rose-500/5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
            <div>
              <strong className="block font-bold">Low Blood Stock Alert Triggered!</strong>
              <span>
                The following groups are below safe operational threshold: {' '}
                <strong className="text-white font-mono">{lowAlerts.map(a => `${a.bloodGroup} (${a.units}u)`).join(', ')}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Donor Registration Modal */}
      {showDonorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white font-outfit mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-rose-400" />
              Register New Voluntary Donor
            </h3>

            <form onSubmit={handleDonorRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Donor Name</label>
                <input
                  type="text"
                  required
                  value={donorForm.name}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  placeholder="e.g. Michael Chang"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={donorForm.bloodGroup}
                    onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={donorForm.age}
                    onChange={(e) => setDonorForm({ ...donorForm, age: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={donorForm.contact}
                  onChange={(e) => setDonorForm({ ...donorForm, contact: e.target.value })}
                  placeholder="+1 (555) 111-9988"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City Zone / Distance</label>
                <input
                  type="text"
                  value={donorForm.city}
                  onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
                  placeholder="e.g. Downtown Hub (2.1 km away)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDonorModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/20"
                >
                  Register Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blood Group Inventory Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white font-outfit mb-4">
          Real-Time Blood Bank Inventory
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {inventory.map((item) => {
            const isLow = item.units <= item.minThreshold;
            return (
              <div
                key={item.bloodGroup}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  isLow
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-md shadow-rose-500/10'
                    : 'bg-slate-800/50 border-slate-700/60'
                }`}
              >
                <div className="text-xl font-extrabold text-white font-outfit mb-1">{item.bloodGroup}</div>
                <div className="text-2xl font-black font-mono text-rose-400 my-1">{item.units} <span className="text-[10px] text-slate-400 font-sans font-normal">units</span></div>
                
                <div className="text-[10px] text-slate-400 mb-2">
                  {isLow ? (
                    <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">LOW</span>
                  ) : (
                    <span className="text-emerald-400">Optimal</span>
                  )}
                </div>

                {(user.role === 'Blood Bank Admin' || user.role === 'Admin') && (
                  <div className="flex items-center justify-center gap-1 pt-2 border-t border-slate-700/50">
                    <button
                      onClick={() => handleUpdateStock(item.bloodGroup, item.units, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateStock(item.bloodGroup, item.units, 1)}
                      className="w-6 h-6 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipient-Donor Compatibility Matcher Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white font-outfit mb-2 flex items-center gap-2">
            <Search className="w-5 h-5 text-teal-400" />
            Patient Donor Compatibility Search
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Select target patient blood type to match compatible living donors and universal donor (O-) rules.
          </p>

          <form onSubmit={handleSearchMatch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Required Blood Type</label>
              <select
                value={searchBloodGroup}
                onChange={(e) => setSearchBloodGroup(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white font-bold focus:border-teal-500 focus:outline-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg} Blood Transfusion</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
            >
              {searching ? 'Matching Algorithm Running...' : 'Find Compatible Available Donors'}
            </button>
          </form>

          {matchResult && (
            <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">
                Compatible Types for {matchResult.requestedBloodGroup}:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.compatibleGroups.map(g => (
                  <span key={g} className="text-xs font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                    {g}
                  </span>
                ))}
              </div>
              <div className="text-xs text-slate-400 pt-1">
                Found <strong>{matchResult.matchedDonors.length}</strong> matching donors nearby.
              </div>
            </div>
          )}
        </div>

        {/* Donors List Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white font-outfit flex items-center justify-between">
            <span>Registered Donors List ({matchResult ? matchResult.matchedDonors.length : donors.length})</span>
          </h2>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {(matchResult ? matchResult.matchedDonors : donors).map((donor) => (
              <div key={donor.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-extrabold font-outfit text-sm">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white font-outfit">{donor.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        {donor.city}
                      </span>
                      <span>•</span>
                      <span>Age: {donor.age}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <a
                    href={`tel:${donor.contact}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg transition"
                  >
                    <Phone className="w-3 h-3" />
                    Contact Donor
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
