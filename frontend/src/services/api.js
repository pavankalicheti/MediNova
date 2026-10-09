import { mockApi } from './mockStore';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('medinova_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}, mockFallbackFn) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok && response.status !== 401 && response.status !== 400 && mockFallbackFn) {
      return await mockFallbackFn();
    }
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred while communicating with the server.');
    }

    return data;
  } catch (err) {
    // If backend endpoint is unreachable (e.g. Netlify static preview), use client-side mock store
    if (mockFallbackFn) {
      console.warn(`[Netlify Static Mode] Server API ${endpoint} unreachable. Using client-side mock store fallback.`);
      return await mockFallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, () => mockApi.login(email, password)),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }, () => mockApi.register(userData)),
  getMe: () => request('/auth/me', {}, () => mockApi.getMe()),

  // Patients & Profile
  getProfile: () => request('/patients/profile', {}, () => mockApi.getProfile()),
  updateProfile: (data) => request('/patients/profile', { method: 'PUT', body: JSON.stringify(data) }, () => mockApi.updateProfile(data)),
  getAllPatients: () => request('/patients/all', {}, () => mockApi.getAllPatients()),

  // Medical Records
  getRecords: (patientId) => request(`/records${patientId ? `?patientId=${patientId}` : ''}`, {}, () => mockApi.getRecords()),
  createRecord: (recordData) => request('/records', { method: 'POST', body: JSON.stringify(recordData) }, () => mockApi.createRecord(recordData)),

  // Appointments
  getAppointments: () => request('/appointments', {}, () => mockApi.getAppointments()),
  getDoctors: () => request('/appointments/doctors', {}, () => mockApi.getDoctors()),
  bookAppointment: (aptData) => request('/appointments', { method: 'POST', body: JSON.stringify(aptData) }, () => mockApi.bookAppointment(aptData)),
  updateAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, () => mockApi.updateAppointmentStatus(id, status)),

  // AI Triage
  getTriageQueue: () => request('/triage/queue', {}, () => mockApi.getTriageQueue()),
  evaluateTriage: (triageData) => request('/triage/evaluate', { method: 'POST', body: JSON.stringify(triageData) }, () => mockApi.evaluateTriage(triageData)),
  updateTriageStatus: (id, status) => request(`/triage/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, () => mockApi.updateTriageStatus(id, status)),

  // Ambulance
  getAmbulances: () => request('/ambulances', {}, () => mockApi.getAmbulances()),
  requestAmbulance: (reqData) => request('/ambulances/request', { method: 'POST', body: JSON.stringify(reqData) }, () => mockApi.requestAmbulance(reqData)),
  updateAmbulanceStatus: (id, status, progress) => request(`/ambulances/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, progress }) }, () => mockApi.updateAmbulanceStatus(id, status, progress)),

  // Blood Bank
  getBloodInventory: () => request('/bloodbank/inventory', {}, () => mockApi.getBloodInventory()),
  updateBloodInventory: (bloodGroup, units) => request('/bloodbank/inventory', { method: 'PUT', body: JSON.stringify({ bloodGroup, units }) }, () => mockApi.updateBloodInventory(bloodGroup, units)),
  getDonors: () => request('/bloodbank/donors', {}, () => mockApi.getDonors()),
  registerDonor: (donorData) => request('/bloodbank/donors', { method: 'POST', body: JSON.stringify(donorData) }, () => mockApi.registerDonor(donorData)),
  matchDonors: (bloodGroup) => request(`/bloodbank/match?bloodGroup=${encodeURIComponent(bloodGroup)}`, {}, () => mockApi.matchDonors(bloodGroup)),

  // Admin
  getAdminStats: () => request('/admin/stats', {}, () => mockApi.getAdminStats()),
  getUsers: () => request('/admin/users', {}, () => mockApi.getUsers()),
  createUser: (userData) => request('/admin/users', { method: 'POST', body: JSON.stringify(userData) }, () => mockApi.createUser(userData)),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }, () => mockApi.deleteUser(id)),
};
