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

  // Telemedicine & Virtual Consultations
  getTelemedicineSessions: () => request('/telemedicine/sessions', {}, () => mockApi.getTelemedicineSessions()),
  bookTelemedicineSession: (sessionData) => request('/telemedicine/sessions', { method: 'POST', body: JSON.stringify(sessionData) }, () => mockApi.bookTelemedicineSession(sessionData)),
  updateTelemedicineStatus: (id, status) => request(`/telemedicine/sessions/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, () => mockApi.updateTelemedicineStatus(id, status)),
  completeTelemedicineSession: (id, data) => request(`/telemedicine/sessions/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }, () => mockApi.completeTelemedicineSession(id, data)),

  // Pharmacy & Medicine Store
  getMedicines: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/pharmacy/medicines${query ? `?${query}` : ''}`, {}, () => mockApi.getMedicines(params));
  },
  addMedicine: (medData) => request('/pharmacy/medicines', { method: 'POST', body: JSON.stringify(medData) }, () => mockApi.addMedicine(medData)),
  updateMedicineStock: (id, additionalStock, reason) => request(`/pharmacy/medicines/${id}/stock`, { method: 'PUT', body: JSON.stringify({ additionalStock, reason }) }, () => mockApi.updateMedicineStock(id, additionalStock, reason)),
  getPrescriptionsToDispense: () => request('/pharmacy/prescriptions', {}, () => mockApi.getPrescriptionsToDispense()),
  dispensePrescription: (data) => request('/pharmacy/dispense', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.dispensePrescription(data)),
  getPharmacyTransactions: () => request('/pharmacy/transactions', {}, () => mockApi.getPharmacyTransactions()),
  getPharmacyOrders: () => request('/pharmacy/orders', {}, () => mockApi.getPharmacyOrders()),
  createPharmacyOrder: (orderData) => request('/pharmacy/orders', { method: 'POST', body: JSON.stringify(orderData) }, () => mockApi.createPharmacyOrder(orderData)),

  // Predictive Analytics Engine
  getAnalyticsOverview: () => request('/analytics/overview', {}, () => mockApi.getAnalyticsOverview()),
  simulateScenario: (scenarioData) => request('/analytics/simulate', { method: 'POST', body: JSON.stringify(scenarioData) }, () => mockApi.simulateScenario(scenarioData)),

  // IoT Wearable Vitals Monitor
  getIotDevices: () => request('/iot/devices', {}, () => mockApi.getIotDevices()),
  pairIotDevice: (deviceData) => request('/iot/devices', { method: 'POST', body: JSON.stringify(deviceData) }, () => mockApi.pairIotDevice(deviceData)),
  updateIotVitals: (id, vitals) => request(`/iot/devices/${id}/vitals`, { method: 'PUT', body: JSON.stringify({ vitals }) }, () => mockApi.updateIotVitals(id, vitals)),
  syncIotDevice: (id) => request(`/iot/devices/${id}/sync`, { method: 'POST' }, () => mockApi.syncIotDevice(id)),
  disconnectIotDevice: (id) => request(`/iot/devices/${id}`, { method: 'DELETE' }, () => mockApi.disconnectIotDevice(id)),
  getIotTelemetry: () => request('/iot/telemetry', {}, () => mockApi.getIotTelemetry()),
  getIotAlerts: () => request('/iot/alerts', {}, () => mockApi.getIotAlerts()),

  // Cross-Hospital EMR Exchange
  getNetworkHospitals: () => request('/emr-exchange/hospitals', {}, () => mockApi.getNetworkHospitals()),
  getExchangeRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/emr-exchange/records${query ? `?${query}` : ''}`, {}, () => mockApi.getExchangeRecords(params));
  },
  importExternalRecord: (id) => request(`/emr-exchange/import/${id}`, { method: 'POST' }, () => mockApi.importExternalRecord(id)),
  dispatchTransferDossier: (data) => request('/emr-exchange/dispatch', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.dispatchTransferDossier(data)),
  getExchangeAuditLog: () => request('/emr-exchange/audit-log', {}, () => mockApi.getExchangeAuditLog()),

  // Genomic Risk Profiling & Pharmacogenomics
  getGenomicProfiles: () => request('/genomics/profiles', {}, () => mockApi.getGenomicProfiles()),
  getPatientGenomicProfile: (patientId) => request(`/genomics/profiles/${patientId}`, {}, () => mockApi.getPatientGenomicProfile(patientId)),
  analyzeGenomicPanel: (data) => request('/genomics/analyze', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.analyzeGenomicPanel(data)),
  checkPharmacogenomics: (data) => request('/genomics/pgx-check', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.checkPharmacogenomics(data)),
  getGenomicCatalog: () => request('/genomics/catalog', {}, () => mockApi.getGenomicCatalog()),

  // Robotic Surgical Tele-Presence
  getRoboticSuites: () => request('/robotic-surgery/suites', {}, () => mockApi.getRoboticSuites()),
  getRoboticSuiteDetail: (id) => request(`/robotic-surgery/suites/${id}`, {}, () => mockApi.getRoboticSuiteDetail(id)),
  switchRoboticControl: (id, mode) => request(`/robotic-surgery/suites/${id}/control`, { method: 'POST', body: JSON.stringify({ mode }) }, () => mockApi.switchRoboticControl(id, mode)),
  calibrateRoboticSuite: (id) => request(`/robotic-surgery/suites/${id}/calibrate`, { method: 'POST' }, () => mockApi.calibrateRoboticSuite(id)),
  emergencyStopRoboticSuite: (id) => request(`/robotic-surgery/suites/${id}/emergency-stop`, { method: 'POST' }, () => mockApi.emergencyStopRoboticSuite(id)),
  scheduleRoboticSurgery: (data) => request('/robotic-surgery/schedule', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.scheduleRoboticSurgery(data)),
  getRoboticSurgicalLogs: () => request('/robotic-surgery/logs', {}, () => mockApi.getRoboticSurgicalLogs()),

  // Quantum-Encrypted Telemetry
  getQuantumNodes: () => request('/quantum/nodes', {}, () => mockApi.getQuantumNodes()),
  getQuantumTelemetryStream: () => request('/quantum/telemetry-stream', {}, () => mockApi.getQuantumTelemetryStream()),
  rotateQuantumKeys: (data) => request('/quantum/rotate-keys', { method: 'POST', body: JSON.stringify(data || {}) }, () => mockApi.rotateQuantumKeys(data)),
  simulateQuantumBreach: (data) => request('/quantum/simulate-breach', { method: 'POST', body: JSON.stringify(data || {}) }, () => mockApi.simulateQuantumBreach(data)),
  resetQuantumBreach: (data) => request('/quantum/reset-breach', { method: 'POST', body: JSON.stringify(data || {}) }, () => mockApi.resetQuantumBreach(data)),
  getQuantumAuditLog: () => request('/quantum/audit-log', {}, () => mockApi.getQuantumAuditLog()),

  // Autonomous Drone Blood Dispatch
  getDroneFleet: () => request('/drones/fleet', {}, () => mockApi.getDroneFleet()),
  getDroneMissions: () => request('/drones/missions', {}, () => mockApi.getDroneMissions()),
  getDroneCorridors: () => request('/drones/corridors', {}, () => mockApi.getDroneCorridors()),
  dispatchDroneMission: (data) => request('/drones/dispatch', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.dispatchDroneMission(data)),
  commandDroneRTH: (id) => request(`/drones/${id}/rth`, { method: 'POST' }, () => mockApi.commandDroneRTH(id)),
  checkDronePayloadTemp: (id) => request(`/drones/${id}/temp-check`, { method: 'POST' }, () => mockApi.checkDronePayloadTemp(id)),

  // AI-Assisted Medical Image Analysis
  getImagingStudies: () => request('/imaging/studies', {}, () => mockApi.getImagingStudies()),
  getImagingStudyDetail: (id) => request(`/imaging/studies/${id}`, {}, () => mockApi.getImagingStudyDetail(id)),
  analyzeMedicalImage: (data) => request('/imaging/analyze', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.analyzeMedicalImage(data)),
  reviewImagingStudy: (id, data) => request(`/imaging/studies/${id}/review`, { method: 'POST', body: JSON.stringify(data) }, () => mockApi.reviewImagingStudy(id, data)),

  // Voice-Enabled Healthcare Assistant
  processVoiceCommand: (prompt) => request('/voice/process-command', { method: 'POST', body: JSON.stringify({ prompt }) }, () => mockApi.processVoiceCommand(prompt)),
  getVoiceHistory: () => request('/voice/history', {}, () => mockApi.getVoiceHistory()),

  // Multilingual Healthcare Assistance
  getLanguages: () => request('/multilingual/languages', {}, () => mockApi.getLanguages()),
  translateClinicalDialogue: (data) => request('/multilingual/translate', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.translateClinicalDialogue(data)),
  getTranslationHistory: () => request('/multilingual/history', {}, () => mockApi.getTranslationHistory()),

  // Advanced Hospital Bed & ICU Management
  getHospitalWards: () => request('/beds/wards', {}, () => mockApi.getHospitalWards()),
  assignPatientBed: (data) => request('/beds/assign', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.assignPatientBed(data)),
  dischargePatientBed: (data) => request('/beds/discharge', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.dischargePatientBed(data)),
  sanitizeBed: (data) => request('/beds/sanitize', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.sanitizeBed(data)),

  // Smart Insurance Integration & Automated Claims
  getInsurancePolicies: () => request('/insurance/policies', {}, () => mockApi.getInsurancePolicies()),
  getInsuranceClaims: () => request('/insurance/claims', {}, () => mockApi.getInsuranceClaims()),
  verifyInsuranceEligibility: (data) => request('/insurance/verify-eligibility', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.verifyInsuranceEligibility(data)),
  submitInsuranceClaim: (data) => request('/insurance/submit-claim', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.submitInsuranceClaim(data)),

  // Neural BCI & Nano-Robotic Therapeutics
  getBciSessions: () => request('/biotech/bci-sessions', {}, () => mockApi.getBciSessions()),
  calibrateBciSensor: (data) => request('/biotech/bci-calibrate', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.calibrateBciSensor(data)),
  getNanoroboticsSwarms: () => request('/biotech/nanorobotics', {}, () => mockApi.getNanoroboticsSwarms()),
  steerNanorobotics: (data) => request('/biotech/nanorobotics/steer', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.steerNanorobotics(data)),

  // Autonomous 3D Bio-Printing & Organ Scaffold Regeneration
  getBioPrinters: () => request('/bioprinting/printers', {}, () => mockApi.getBioPrinters()),
  getBioPrintJobs: () => request('/bioprinting/jobs', {}, () => mockApi.getBioPrintJobs()),
  createBioPrintJob: (data) => request('/bioprinting/jobs', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.createBioPrintJob(data)),
  calibrateBioPrinter: (id) => request(`/bioprinting/printers/${id}/calibrate`, { method: 'POST' }, () => mockApi.calibrateBioPrinter(id)),

  // Deep-Space & Remote Telemetry Relay
  getSpaceNodes: () => request('/space-telemetry/nodes', {}, () => mockApi.getSpaceNodes()),
  getSpaceCrewVitals: () => request('/space-telemetry/crew', {}, () => mockApi.getSpaceCrewVitals()),
  pingSpaceTelemetry: (nodeId) => request('/space-telemetry/ping', { method: 'POST', body: JSON.stringify({ nodeId }) }, () => mockApi.pingSpaceTelemetry(nodeId)),
  adjustSpaceLifeSupport: (data) => request('/space-telemetry/adjust-lifesupport', { method: 'POST', body: JSON.stringify(data) }, () => mockApi.adjustSpaceLifeSupport(data)),
};




