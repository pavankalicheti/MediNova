import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Stethoscope, Calendar, AlertTriangle, Truck, Droplet, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'Doctor',
    specialty: 'Cardiology',
    department: 'Cardiovascular Care',
    contact: '+1 (555) 300-9900'
  });

  const fetchData = async () => {
    try {
      const [statRes, userRes] = await Promise.all([
        api.getAdminStats(),
        api.getUsers()
      ]);
      setStats(statRes.stats || null);
      setUsers(userRes.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(newUserForm);
      setShowAddModal(false);
      setNewUserForm({
        name: '',
        email: '',
        password: 'password123',
        role: 'Doctor',
        specialty: 'Cardiology',
        department: 'Cardiovascular Care',
        contact: '+1 (555) 300-9900'
      });
      fetchData();
    } catch (err) {
      alert('Error creating user: ' + err.message);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove user '${name}'?`)) return;
    try {
      await api.deleteUser(id);
      fetchData();
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Executive Operations Control (Phase A)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 font-outfit">System Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global healthcare metrics analytics, active doctor roster, and staff authorization control.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Doctor / Staff Account
        </button>
      </div>

      {/* System Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Total Patients</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-800 font-outfit mt-2">{stats.totalPatients}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Active Doctors</span>
              <Stethoscope className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-800 font-outfit mt-2">{stats.totalDoctors}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Appointments</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-800 font-outfit mt-2">{stats.totalAppointments}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Critical Triage</span>
              <AlertTriangle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600 font-outfit mt-2">{stats.criticalTriage}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Ambulance Active</span>
              <Truck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-800 font-outfit mt-2">{stats.activeAmbulanceRequests}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Low Blood Alerts</span>
              <Droplet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600 font-outfit mt-2">{stats.lowBloodStockCount}</div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Add Doctor or Staff Member
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Dr. Gregory House"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="house@medinova.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">System Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Ambulance Driver">Ambulance Driver</option>
                    <option value="Blood Bank Admin">Blood Bank Admin</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Specialty / Unit</label>
                  <input
                    type="text"
                    value={newUserForm.specialty}
                    onChange={(e) => setNewUserForm({ ...newUserForm, specialty: e.target.value })}
                    placeholder="e.g. Cardiology"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff & Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 font-outfit mb-4 flex items-center justify-between">
          <span>System Users Directory ({users.length})</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading user records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Specialty / Detail</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.specialty || u.department || u.vehicleNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {u.contact || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
