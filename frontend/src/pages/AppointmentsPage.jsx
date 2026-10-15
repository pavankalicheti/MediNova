import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, Stethoscope, CheckCircle2, XCircle, Plus, Filter } from 'lucide-react';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:30 AM',
    reason: 'Routine Health Consultation'
  });

  const fetchData = async () => {
    try {
      const [aptRes, docRes] = await Promise.all([
        api.getAppointments(),
        api.getDoctors()
      ]);
      setAppointments(aptRes.appointments || []);
      setDoctors(docRes.doctors || []);
      if (docRes.doctors && docRes.doctors.length > 0) {
        setBookingForm(prev => ({ ...prev, doctorId: docRes.doctors[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      fetchData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.bookAppointment(bookingForm);
      setShowBookingModal(false);
      fetchData();
    } catch (err) {
      alert('Error booking appointment: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-600 text-white border-blue-700 font-semibold';
      case 'Booked': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Cancelled': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Smart Scheduling Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 font-outfit">Appointment Scheduling</h1>
          <p className="text-xs text-slate-500 mt-1">
            {user.role === 'Patient' ? 'View available doctors, select preferred timeslots, and book consultations.' : 'Manage patient consultation calendar and appointment lifecycle.'}
          </p>
        </div>

        {user.role === 'Patient' && (
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Book New Appointment
          </button>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 font-outfit mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Book Doctor Consultation
            </h3>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Doctor</label>
                <select
                  value={bookingForm.doctorId}
                  onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} ({doc.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Time Slot</label>
                  <select
                    value={bookingForm.timeSlot}
                    onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reason for Visit</label>
                <textarea
                  rows="2"
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  placeholder="Describe your health symptoms or routine checkup purpose..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments List Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 font-outfit mb-4 flex items-center justify-between">
          <span>Scheduled Appointments ({appointments.length})</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No appointments scheduled.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-600 font-mono">{apt.department}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-800 font-outfit mb-1">{apt.patientName}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 mb-2">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span>{apt.doctorName}</span>
                  </div>

                  <div className="text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      {apt.timeSlot}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-2">
                    <strong className="text-slate-600">Reason:</strong> {apt.reason}
                  </div>
                </div>

                {/* Status Action Buttons for Doctors/Receptionists/Admins */}
                {user.role !== 'Patient' && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 text-xs">
                    {apt.status !== 'Confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(apt.id, 'Confirmed')}
                        className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg border border-blue-600 text-[11px] font-medium transition"
                      >
                        Confirm
                      </button>
                    )}
                    {apt.status !== 'Completed' && (
                      <button
                        onClick={() => handleStatusUpdate(apt.id, 'Completed')}
                        className="flex-1 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 text-[11px] font-medium transition"
                      >
                        Complete
                      </button>
                    )}
                    {apt.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleStatusUpdate(apt.id, 'Cancelled')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 text-[11px] font-medium transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
