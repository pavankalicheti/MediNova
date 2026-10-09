/**
 * MediNova Client-Side Fallback Store
 * Used automatically when deployed statically (e.g. Netlify Drop) 
 * where a local Express backend server isn't reachable over network.
 */

export function calculateTriagePriority({ age, symptoms = [], heartRate, bpSys, bpDia, spo2, temperature }) {
  let score = 0;
  const flags = [];

  const hr = parseFloat(heartRate) || 75;
  const sys = parseFloat(bpSys) || 120;
  const dia = parseFloat(bpDia) || 80;
  const o2 = parseFloat(spo2) || 98;
  const temp = parseFloat(temperature) || 37.0;
  const patientAge = parseInt(age) || 30;

  if (o2 < 90) { score += 45; flags.push('Severe Hypoxia (SpO2 < 90%)'); }
  else if (o2 < 94) { score += 25; flags.push('Moderate Hypoxia (SpO2 < 94%)'); }

  if (hr > 140 || hr < 40) { score += 35; flags.push(`Extreme Heart Rate (${hr} bpm)`); }
  else if (hr > 110 || hr < 50) { score += 20; flags.push(`Abnormal Heart Rate (${hr} bpm)`); }

  if (sys >= 180 || sys <= 80 || dia >= 110) { score += 30; flags.push(`Hypertensive Crisis or Shock (BP ${sys}/${dia})`); }
  else if (sys >= 140 || sys <= 90) { score += 15; flags.push(`Abnormal Blood Pressure (BP ${sys}/${dia})`); }

  if (temp >= 40.0 || temp <= 35.0) { score += 25; flags.push(`Severe Hyperthermia / Hypothermia (${temp}°C)`); }
  else if (temp >= 38.5) { score += 10; flags.push(`High Fever (${temp}°C)`); }

  if (patientAge <= 2 || patientAge >= 70) { score += 10; flags.push('High-risk age bracket'); }

  const symptomText = (Array.isArray(symptoms) ? symptoms.join(' ') : symptoms).toLowerCase();
  
  const criticalKeywords = ['chest pain', 'unconscious', 'cardiac', 'severe bleeding', 'seizure', 'cannot breathe', 'stroke', 'anaphylaxis'];
  const urgentKeywords = ['shortness of breath', 'fracture', 'fainting', 'head injury', 'severe pain', 'blood in stool', 'persistent vomiting'];
  const moderateKeywords = ['fever', 'abdominal pain', 'dizziness', 'moderate pain', 'deep cut', 'coughing'];

  let matchedCritical = criticalKeywords.filter(k => symptomText.includes(k));
  let matchedUrgent = urgentKeywords.filter(k => symptomText.includes(k));
  let matchedModerate = moderateKeywords.filter(k => symptomText.includes(k));

  if (matchedCritical.length > 0) { score += 40 * matchedCritical.length; flags.push(`High-risk symptom: ${matchedCritical.join(', ')}`); }
  if (matchedUrgent.length > 0) { score += 20 * matchedUrgent.length; flags.push(`Urgent symptom: ${matchedUrgent.join(', ')}`); }
  if (matchedModerate.length > 0) { score += 10 * matchedModerate.length; }

  let priority = 'Low';
  let color = 'emerald';
  let recommendedAction = 'Routine consultation in Outpatient Clinic.';
  let department = 'General Medicine';

  if (score >= 65) {
    priority = 'Critical';
    color = 'red';
    recommendedAction = 'IMMEDIATE Resuscitation / ER Trauma Bay Admission.';
    department = 'Emergency Department (Resuscitation)';
  } else if (score >= 45) {
    priority = 'Urgent';
    color = 'amber';
    recommendedAction = 'Urgent Medical Assessment within 15-30 minutes.';
    department = 'Urgent Care / Cardiology / Pulmonology';
  } else if (score >= 25) {
    priority = 'Moderate';
    color = 'yellow';
    recommendedAction = 'Standard Medical Evaluation within 60 minutes.';
    department = 'General Outpatient Care';
  }

  return {
    score: Math.min(score, 100),
    priority,
    color,
    flags,
    recommendedAction,
    department,
    evaluatedAt: new Date().toISOString()
  };
}

const INITIAL_DATA = {
  users: [
    { id: 'usr_pat_1', email: 'patient@medinova.com', password: 'password123', name: 'Sarah Jenkins', role: 'Patient', age: 34, gender: 'Female', contact: '+1 (555) 234-5678', bloodGroup: 'O+', medicalHistory: 'Mild asthmatic history, allergic to penicillin. Previous appendectomy (2021).', emergencyContact: 'Tom Jenkins (Husband) - +1 (555) 998-1122' },
    { id: 'usr_pat_2', email: 'john.doe@medinova.com', password: 'password123', name: 'John Doe', role: 'Patient', age: 58, gender: 'Male', contact: '+1 (555) 876-5432', bloodGroup: 'B-', medicalHistory: 'Type 2 Diabetes, Hypertension managed with Metformin.', emergencyContact: 'Mary Doe (Wife) - +1 (555) 443-2211' },
    { id: 'usr_doc_1', email: 'doctor@medinova.com', password: 'password123', name: 'Dr. Marcus Vance', role: 'Doctor', specialty: 'Cardiology', department: 'Cardiovascular Care', contact: '+1 (555) 300-1001' },
    { id: 'usr_doc_2', email: 'doctor2@medinova.com', password: 'password123', name: 'Dr. Elena Rostova', role: 'Doctor', specialty: 'Neurology', department: 'Brain & Spine Institute', contact: '+1 (555) 300-1002' },
    { id: 'usr_rec_1', email: 'receptionist@medinova.com', password: 'password123', name: 'David Miller', role: 'Receptionist', contact: '+1 (555) 400-0010' },
    { id: 'usr_drv_1', email: 'driver@medinova.com', password: 'password123', name: 'Robert Taylor', role: 'Ambulance Driver', contact: '+1 (555) 500-0099', vehicleNumber: 'AMB-9021', status: 'Available' },
    { id: 'usr_bb_1', email: 'bloodbank@medinova.com', password: 'password123', name: 'Dr. Aris Thorne', role: 'Blood Bank Admin', contact: '+1 (555) 600-0707' },
    { id: 'usr_adm_1', email: 'admin@medinova.com', password: 'password123', name: 'Clara Oswald', role: 'Admin', contact: '+1 (555) 900-0001' }
  ],
  records: [
    { id: 'rec_1', patientId: 'usr_pat_1', patientName: 'Sarah Jenkins', doctorId: 'usr_doc_1', doctorName: 'Dr. Marcus Vance', date: '2026-09-10', diagnosis: 'Mild Sinus Tachycardia & Fatigue', symptoms: 'Palpitations after exertion', prescriptions: [{ name: 'Metoprolol', dosage: '25mg', frequency: 'Once daily' }], labResults: 'ECG normal sinus rhythm.', doctorNotes: 'Advised reduced caffeine intake.' }
  ],
  appointments: [
    { id: 'apt_1', patientId: 'usr_pat_1', patientName: 'Sarah Jenkins', doctorId: 'usr_doc_1', doctorName: 'Dr. Marcus Vance', department: 'Cardiology', date: '2026-10-15', timeSlot: '10:30 AM', reason: 'Routine ECG checkup', status: 'Confirmed' }
  ],
  triageQueue: [
    {
      id: 'trg_101', patientName: 'Arthur Dent', age: 42, gender: 'Male', contact: '+1 (555) 777-1234', symptoms: 'Acute crushing chest pain, diaphoresis, shortness of breath', heartRate: 128, bpSys: 178, bpDia: 102, spo2: 89, temperature: 37.4, status: 'Active ER Queue', submittedAt: '2026-10-09T20:15:00Z',
      priorityResult: calculateTriagePriority({ age: 42, symptoms: ['chest pain', 'shortness of breath'], heartRate: 128, bpSys: 178, bpDia: 102, spo2: 89, temperature: 37.4 })
    }
  ],
  ambulanceRequests: [
    { id: 'amb_req_1', patientName: 'Arthur Dent', contact: '+1 (555) 777-1234', pickupLocation: '742 Evergreen Terrace, Sector 4', latitude: 40.7306, longitude: -73.9352, driverId: 'usr_drv_1', driverName: 'Robert Taylor', vehicleNumber: 'AMB-9021', status: 'En route', progress: 45 }
  ],
  bloodInventory: [
    { bloodGroup: 'A+', units: 18, minThreshold: 5, status: 'Normal' },
    { bloodGroup: 'A-', units: 4, minThreshold: 5, status: 'Low Stock' },
    { bloodGroup: 'B+', units: 24, minThreshold: 5, status: 'Normal' },
    { bloodGroup: 'B-', units: 3, minThreshold: 5, status: 'Low Stock' },
    { bloodGroup: 'AB+', units: 12, minThreshold: 5, status: 'Normal' },
    { bloodGroup: 'AB-', units: 2, minThreshold: 5, status: 'Critical Low' },
    { bloodGroup: 'O+', units: 30, minThreshold: 10, status: 'Normal' },
    { bloodGroup: 'O-', units: 4, minThreshold: 10, status: 'Critical Low' }
  ],
  bloodDonors: [
    { id: 'dnr_1', name: 'Michael Chang', bloodGroup: 'O-', age: 29, contact: '+1 (555) 111-9988', city: 'Downtown Hub (2.1 km away)', isAvailable: true },
    { id: 'dnr_2', name: 'Rebecca Stone', bloodGroup: 'O-', age: 35, contact: '+1 (555) 222-3344', city: 'Westside Heights (4.5 km away)', isAvailable: true }
  ]
};

function getLocalStore() {
  const data = localStorage.getItem('medinova_local_store');
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  localStorage.setItem('medinova_local_store', JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
}

function saveLocalStore(store) {
  localStorage.setItem('medinova_local_store', JSON.stringify(store));
}

export const mockApi = {
  login: async (email, password) => {
    const db = getLocalStore();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) throw new Error('Invalid credentials.');
    const { password: _, ...userWithoutPw } = user;
    localStorage.setItem('medinova_demo_user', JSON.stringify(userWithoutPw));
    return { token: 'mock_jwt_' + user.id, user: userWithoutPw };
  },
  register: async (userData) => {
    const db = getLocalStore();
    const newUser = { id: 'usr_' + Date.now(), ...userData };
    db.users.push(newUser);
    saveLocalStore(db);
    const { password: _, ...userWithoutPw } = newUser;
    localStorage.setItem('medinova_demo_user', JSON.stringify(userWithoutPw));
    return { token: 'mock_jwt_' + newUser.id, user: userWithoutPw };
  },
  getMe: async () => {
    const user = localStorage.getItem('medinova_demo_user');
    if (user) return { user: JSON.parse(user) };
    throw new Error('Not logged in');
  },
  getProfile: async () => {
    const user = JSON.parse(localStorage.getItem('medinova_demo_user') || '{}');
    return { profile: user };
  },
  updateProfile: async (data) => {
    const db = getLocalStore();
    const user = JSON.parse(localStorage.getItem('medinova_demo_user') || '{}');
    const idx = db.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...data };
      saveLocalStore(db);
      const { password: _, ...updated } = db.users[idx];
      localStorage.setItem('medinova_demo_user', JSON.stringify(updated));
      return { profile: updated };
    }
    return { profile: { ...user, ...data } };
  },
  getAllPatients: async () => {
    const db = getLocalStore();
    return { patients: db.users.filter(u => u.role === 'Patient') };
  },
  getRecords: async () => {
    const db = getLocalStore();
    return { records: db.records };
  },
  createRecord: async (data) => {
    const db = getLocalStore();
    const pat = db.users.find(u => u.id === data.patientId) || { name: 'Patient' };
    const doc = JSON.parse(localStorage.getItem('medinova_demo_user') || '{}');
    const newRec = {
      id: 'rec_' + Date.now(),
      patientId: data.patientId,
      patientName: pat.name,
      doctorId: doc.id || 'usr_doc_1',
      doctorName: doc.name || 'Dr. Medical Staff',
      date: new Date().toISOString().split('T')[0],
      diagnosis: data.diagnosis,
      symptoms: data.symptoms || 'None',
      prescriptions: data.prescriptions ? [{ name: data.prescriptions, dosage: 'As directed', frequency: 'Daily' }] : [],
      labResults: data.labResults || 'Pending',
      doctorNotes: data.doctorNotes || ''
    };
    db.records.unshift(newRec);
    saveLocalStore(db);
    return { record: newRec };
  },
  getAppointments: async () => {
    const db = getLocalStore();
    return { appointments: db.appointments };
  },
  getDoctors: async () => {
    const db = getLocalStore();
    return { doctors: db.users.filter(u => u.role === 'Doctor') };
  },
  bookAppointment: async (data) => {
    const db = getLocalStore();
    const doc = db.users.find(u => u.id === data.doctorId) || { name: 'Dr. Marcus Vance' };
    const user = JSON.parse(localStorage.getItem('medinova_demo_user') || '{}');
    const newApt = {
      id: 'apt_' + Date.now(),
      patientId: user.id || 'usr_pat_1',
      patientName: user.name || 'Sarah Jenkins',
      doctorId: doc.id,
      doctorName: doc.name,
      department: doc.department || 'Cardiology',
      date: data.date,
      timeSlot: data.timeSlot,
      reason: data.reason,
      status: 'Booked'
    };
    db.appointments.unshift(newApt);
    saveLocalStore(db);
    return { appointment: newApt };
  },
  updateAppointmentStatus: async (id, status) => {
    const db = getLocalStore();
    const apt = db.appointments.find(a => a.id === id);
    if (apt) apt.status = status;
    saveLocalStore(db);
    return { appointment: apt };
  },
  getTriageQueue: async () => {
    const db = getLocalStore();
    return { queue: db.triageQueue };
  },
  evaluateTriage: async (data) => {
    const db = getLocalStore();
    const priorityResult = calculateTriagePriority(data);
    const newEntry = {
      id: 'trg_' + Date.now(),
      patientName: data.patientName || 'Emergency Patient',
      age: parseInt(data.age) || 30,
      gender: data.gender || 'Male',
      contact: data.contact || '+1 555-911',
      symptoms: Array.isArray(data.symptoms) ? data.symptoms.join(', ') : data.symptoms,
      heartRate: parseFloat(data.heartRate),
      bpSys: parseFloat(data.bpSys),
      bpDia: parseFloat(data.bpDia) || 80,
      spo2: parseFloat(data.spo2),
      temperature: parseFloat(data.temperature) || 37.0,
      priorityResult,
      status: 'Active ER Queue',
      submittedAt: new Date().toISOString()
    };
    db.triageQueue.unshift(newEntry);
    saveLocalStore(db);
    return { triageEntry: newEntry };
  },
  updateTriageStatus: async (id, status) => {
    const db = getLocalStore();
    const entry = db.triageQueue.find(t => t.id === id);
    if (entry) entry.status = status;
    saveLocalStore(db);
    return { entry };
  },
  getAmbulances: async () => {
    const db = getLocalStore();
    return { requests: db.ambulanceRequests, drivers: db.users.filter(u => u.role === 'Ambulance Driver') };
  },
  requestAmbulance: async (data) => {
    const db = getLocalStore();
    const newReq = {
      id: 'amb_req_' + Date.now(),
      patientName: 'Emergency Patient',
      pickupLocation: data.pickupLocation,
      latitude: data.latitude || 40.7306,
      longitude: data.longitude || -73.9352,
      driverName: 'Robert Taylor',
      vehicleNumber: 'AMB-9021',
      status: 'Assigned',
      progress: 15
    };
    db.ambulanceRequests.unshift(newReq);
    saveLocalStore(db);
    return { request: newReq };
  },
  updateAmbulanceStatus: async (id, status, progress) => {
    const db = getLocalStore();
    const req = db.ambulanceRequests.find(r => r.id === id);
    if (req) {
      req.status = status;
      if (progress !== undefined) req.progress = progress;
    }
    saveLocalStore(db);
    return { request: req };
  },
  getBloodInventory: async () => {
    const db = getLocalStore();
    const lowStockAlerts = db.bloodInventory.filter(i => i.units <= i.minThreshold);
    return { inventory: db.bloodInventory, lowStockAlerts };
  },
  updateBloodInventory: async (bloodGroup, units) => {
    const db = getLocalStore();
    const item = db.bloodInventory.find(i => i.bloodGroup.toUpperCase() === bloodGroup.toUpperCase());
    if (item) {
      item.units = units;
      item.status = units <= 3 ? 'Critical Low' : (units <= item.minThreshold ? 'Low Stock' : 'Normal');
    }
    saveLocalStore(db);
    return { item };
  },
  getDonors: async () => {
    const db = getLocalStore();
    return { donors: db.bloodDonors };
  },
  registerDonor: async (data) => {
    const db = getLocalStore();
    const newDonor = { id: 'dnr_' + Date.now(), ...data, isAvailable: true };
    db.bloodDonors.unshift(newDonor);
    saveLocalStore(db);
    return { donor: newDonor };
  },
  matchDonors: async (bloodGroup) => {
    const db = getLocalStore();
    const bgUpper = bloodGroup.toUpperCase();
    const map = {
      'O-': ['O-'], 'O+': ['O+', 'O-'], 'A-': ['A-', 'O-'], 'A+': ['A+', 'A-', 'O+', 'O-'],
      'B-': ['B-', 'O-'], 'B+': ['B+', 'B-', 'O+', 'O-'], 'AB-': ['AB-', 'A-', 'B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    };
    const comp = map[bgUpper] || [bgUpper];
    const matched = db.bloodDonors.filter(d => comp.includes(d.bloodGroup));
    return { requestedBloodGroup: bgUpper, compatibleGroups: comp, matchedDonors: matched };
  },
  getAdminStats: async () => {
    const db = getLocalStore();
    return {
      stats: {
        totalPatients: db.users.filter(u => u.role === 'Patient').length,
        totalDoctors: db.users.filter(u => u.role === 'Doctor').length,
        totalStaff: db.users.filter(u => u.role !== 'Patient' && u.role !== 'Doctor').length,
        totalAppointments: db.appointments.length,
        pendingAppointments: db.appointments.filter(a => a.status === 'Booked').length,
        criticalTriage: db.triageQueue.filter(t => t.priorityResult && t.priorityResult.priority === 'Critical').length,
        activeEmergencies: db.triageQueue.filter(t => t.status === 'Active ER Queue').length,
        activeAmbulanceRequests: db.ambulanceRequests.filter(r => r.status !== 'Completed').length,
        lowBloodStockCount: db.bloodInventory.filter(i => i.units <= i.minThreshold).length
      }
    };
  },
  getUsers: async () => {
    const db = getLocalStore();
    return { users: db.users };
  },
  createUser: async (data) => {
    const db = getLocalStore();
    const newU = { id: 'usr_adm_' + Date.now(), ...data };
    db.users.push(newU);
    saveLocalStore(db);
    return { user: newU };
  },
  deleteUser: async (id) => {
    const db = getLocalStore();
    db.users = db.users.filter(u => u.id !== id);
    saveLocalStore(db);
    return { message: 'Deleted' };
  }
};
