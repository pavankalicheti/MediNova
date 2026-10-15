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
    { id: 'usr_pharm_1', email: 'pharmacist@medinova.com', password: 'password123', name: 'Elena Gilbert, PharmD', role: 'Pharmacist', contact: '+1 (555) 700-4411' },
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
  ],
  telemedicineSessions: [
    {
      id: 'tele_1',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      patientContact: '+1 (555) 234-5678',
      patientAge: 34,
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Marcus Vance',
      specialty: 'Cardiology',
      date: '2026-10-16',
      timeSlot: '02:00 PM',
      reason: 'Post-medication ECG review & palpitations follow-up',
      status: 'Scheduled',
      roomId: 'room_cardio_jenkins_101',
      videoUrl: 'https://medinova.telehealth.live/room_cardio_jenkins_101',
      notes: '',
      prescription: [],
      createdAt: '2026-10-15T08:30:00Z'
    },
    {
      id: 'tele_2',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      patientContact: '+1 (555) 876-5432',
      patientAge: 58,
      doctorId: 'usr_doc_2',
      doctorName: 'Dr. Elena Rostova',
      specialty: 'Neurology',
      date: '2026-10-16',
      timeSlot: '03:30 PM',
      reason: 'Diabetic peripheral neuropathy tele-consultation',
      status: 'In-Progress',
      roomId: 'room_neuro_doe_202',
      videoUrl: 'https://medinova.telehealth.live/room_neuro_doe_202',
      notes: 'Patient reports mild tingling in lower extremities during evening hours.',
      prescription: [
        { name: 'Pregabalin', dosage: '75mg', frequency: 'Once daily at bedtime', days: '14 days' }
      ],
      createdAt: '2026-10-15T11:00:00Z'
    },
    {
      id: 'tele_3',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      patientContact: '+1 (555) 234-5678',
      patientAge: 34,
      doctorId: 'usr_doc_3',
      doctorName: 'Dr. Arthur Pendelton',
      specialty: 'Emergency Medicine',
      date: '2026-10-12',
      timeSlot: '12:00 PM',
      reason: 'Acute allergic rhinitis & seasonal cough consultation',
      status: 'Completed',
      roomId: 'room_er_jenkins_099',
      videoUrl: 'https://medinova.telehealth.live/room_er_jenkins_099',
      notes: 'Consultation conducted via encrypted video stream. Pharyngeal erythema mild. Advised oral antihistamine and steam inhalation.',
      prescription: [
        { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily at bedtime', days: '7 days' }
      ],
      createdAt: '2026-10-12T09:00:00Z',
      completedAt: '2026-10-12T12:25:00Z'
    }
  ],
  medicines: [
    { id: 'med_1', name: 'Metformin Hydrochloride', category: 'Diabetes Care', dosage: '500mg', form: 'Tablet', stock: 450, reorderLevel: 100, unitPrice: 12.50, expiryDate: '2027-08-30', manufacturer: 'Novartis Pharma', status: 'In Stock', description: 'First-line medication for the management of type 2 diabetes.' },
    { id: 'med_2', name: 'Metoprolol Tartrate', category: 'Cardiovascular', dosage: '25mg', form: 'Tablet', stock: 85, reorderLevel: 90, unitPrice: 18.20, expiryDate: '2027-05-15', manufacturer: 'AstraZeneca', status: 'Low Stock', description: 'Selective beta-blocker for hypertension and angina prophylaxis.' },
    { id: 'med_3', name: 'Amoxicillin Trihydrate', category: 'Antibiotics', dosage: '500mg', form: 'Capsule', stock: 320, reorderLevel: 80, unitPrice: 15.00, expiryDate: '2026-11-30', manufacturer: 'GlaxoSmithKline', status: 'In Stock', description: 'Broad-spectrum beta-lactam antibiotic for bacterial infections.' },
    { id: 'med_4', name: 'Atorvastatin Calcium', category: 'Cardiovascular', dosage: '20mg', form: 'Tablet', stock: 240, reorderLevel: 60, unitPrice: 22.00, expiryDate: '2027-12-01', manufacturer: 'Pfizer Inc.', status: 'In Stock', description: 'Lipid-lowering agent for hypercholesterolemia.' },
    { id: 'med_5', name: 'Albuterol Sulfate Inhaler', category: 'Respiratory', dosage: '90mcg/actuation', form: 'Metered Inhaler', stock: 35, reorderLevel: 50, unitPrice: 38.00, expiryDate: '2027-03-20', manufacturer: 'Teva Respiratory', status: 'Low Stock', description: 'Short-acting beta2-agonist for acute bronchospasm relief.' },
    { id: 'med_6', name: 'Epinephrine Auto-Injector', category: 'Emergency Medicine', dosage: '0.3mg', form: 'Auto-Injector', stock: 12, reorderLevel: 25, unitPrice: 145.00, expiryDate: '2026-12-15', manufacturer: 'Mylan Specialty', status: 'Critical Low', description: 'Emergency treatment of systemic anaphylaxis.' },
    { id: 'med_7', name: 'Lisinopril', category: 'Cardiovascular', dosage: '10mg', form: 'Tablet', stock: 210, reorderLevel: 70, unitPrice: 9.80, expiryDate: '2028-02-14', manufacturer: 'Lupin Pharma', status: 'In Stock', description: 'ACE inhibitor for essential hypertension.' },
    { id: 'med_8', name: 'Paracetamol (Acetaminophen)', category: 'Analgesics & Fever', dosage: '650mg', form: 'Tablet', stock: 1200, reorderLevel: 200, unitPrice: 4.50, expiryDate: '2028-06-30', manufacturer: 'Cipla Global', status: 'In Stock', description: 'Analgesic and antipyretic for pain and fever.' },
    { id: 'med_9', name: 'Pregabalin', category: 'Neurology & Pain', dosage: '75mg', form: 'Capsule', stock: 160, reorderLevel: 40, unitPrice: 28.50, expiryDate: '2027-09-10', manufacturer: 'Pfizer Inc.', status: 'In Stock', description: 'Indicated for neuropathic pain associated with diabetic neuropathy.' },
    { id: 'med_10', name: 'Insulin Glargine (Lantus)', category: 'Diabetes Care', dosage: '100 units/mL (3mL pen)', form: 'Injectable Pen', stock: 28, reorderLevel: 30, unitPrice: 65.00, expiryDate: '2026-11-20', manufacturer: 'Sanofi-Aventis', status: 'Low Stock', description: 'Recombinant human insulin analog for basal glycemic control.' }
  ],
  pharmacyTransactions: [
    { id: 'txn_101', type: 'DISPENSED', medicineId: 'med_2', medicineName: 'Metoprolol Tartrate', quantity: 30, patientId: 'usr_pat_1', patientName: 'Sarah Jenkins', performedBy: 'Elena Gilbert, PharmD', referencePrescriptionId: 'rec_1', date: '2026-10-10T14:30:00Z', notes: 'Dispensed per Dr. Vance prescription record #rec_1.' },
    { id: 'txn_102', type: 'RESTOCKED', medicineId: 'med_8', medicineName: 'Paracetamol (Acetaminophen)', quantity: 500, performedBy: 'Elena Gilbert, PharmD', batchNumber: 'BATCH-2026-908', date: '2026-10-08T09:15:00Z', notes: 'Wholesale batch delivery accepted and stocked.' },
    { id: 'txn_103', type: 'PATIENT_PURCHASE', medicineId: 'med_5', medicineName: 'Albuterol Sulfate Inhaler', quantity: 1, patientId: 'usr_pat_1', patientName: 'Sarah Jenkins', performedBy: 'Online Patient Store Checkout', date: '2026-10-12T10:20:00Z', notes: 'Direct online order fulfilled with home dispatch.' }
  ],
  pharmacyOrders: [
    {
      id: 'ord_1001',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      items: [
        { medicineId: 'med_8', name: 'Paracetamol (Acetaminophen)', quantity: 2, unitPrice: 4.50 },
        { medicineId: 'med_5', name: 'Albuterol Sulfate Inhaler', quantity: 1, unitPrice: 38.00 }
      ],
      totalAmount: 47.00,
      status: 'Delivered',
      paymentStatus: 'Paid (Digital Wallet)',
      deliveryAddress: '124 Maple Street, Apt 4B, Central City',
      createdAt: '2026-10-12T10:20:00Z'
    }
  ],
  analyticsHistorical: {
    weeklyAdmissions: [
      { day: 'Mon', actual: 142, projected: 138, erCount: 38, urgentCount: 64, routineCount: 40 },
      { day: 'Tue', actual: 155, projected: 150, erCount: 45, urgentCount: 70, routineCount: 40 },
      { day: 'Wed', actual: 168, projected: 162, erCount: 52, urgentCount: 74, routineCount: 42 },
      { day: 'Thu', actual: 149, projected: 155, erCount: 41, urgentCount: 68, routineCount: 40 },
      { day: 'Fri', actual: 182, projected: 178, erCount: 60, urgentCount: 82, routineCount: 40 },
      { day: 'Sat', actual: 195, projected: 190, erCount: 72, urgentCount: 85, routineCount: 38 },
      { day: 'Sun (Today)', actual: 174, projected: 170, erCount: 58, urgentCount: 78, routineCount: 38 }
    ],
    next7DaysForecast: [
      { day: 'Mon (+1d)', expectedAdmissions: 162, surgeProbability: 38, riskLevel: 'Normal', note: 'Standard OPD load' },
      { day: 'Tue (+2d)', expectedAdmissions: 175, surgeProbability: 54, riskLevel: 'Moderate', note: 'Weather front shift' },
      { day: 'Wed (+3d)', expectedAdmissions: 198, surgeProbability: 79, riskLevel: 'High Surge', note: 'Projected respiratory influx' },
      { day: 'Thu (+4d)', expectedAdmissions: 185, surgeProbability: 66, riskLevel: 'Moderate', note: 'Cardio follow-ups peak' },
      { day: 'Fri (+5d)', expectedAdmissions: 215, surgeProbability: 86, riskLevel: 'Critical Surge', note: 'Weekend pre-admission wave' },
      { day: 'Sat (+6d)', expectedAdmissions: 220, surgeProbability: 88, riskLevel: 'Critical Surge', note: 'Trauma & emergency peak' },
      { day: 'Sun (+7d)', expectedAdmissions: 180, surgeProbability: 62, riskLevel: 'Moderate', note: 'Gradual de-escalation' }
    ],
    resourceUtilization: {
      totalGeneralBeds: 250,
      occupiedGeneralBeds: 205,
      totalIcuBeds: 45,
      occupiedIcuBeds: 40,
      totalVentilators: 20,
      occupiedVentilators: 15,
      activeDoctorsOnDuty: 28,
      ambulancesOperational: 8,
      ambulancesDispatched: 5
    }
  },
  iotDevices: [
    {
      id: 'iot_dev_1',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      deviceName: 'MediPatch Continuous PPG & ECG Sensor',
      model: 'BioBeat BioPatch Pro-4',
      type: 'Wearable Biosensor',
      connectionType: 'Bluetooth 5.3 Low Energy',
      status: 'Connected',
      battery: 88,
      signalStrength: -58,
      lastSync: new Date().toISOString(),
      currentVitals: {
        heartRate: 74,
        spO2: 98,
        bpSys: 122,
        bpDia: 78,
        temperature: 36.8,
        bloodGlucose: 104,
        respirationRate: 16
      },
      alertThresholds: {
        hrMax: 110,
        hrMin: 50,
        spo2Min: 94,
        bpSysMax: 140,
        bpDiaMax: 90
      }
    },
    {
      id: 'iot_dev_2',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      deviceName: 'Continuous Glucose & Cardio Monitor',
      model: 'Dexcom G7 + Withings ScanWatch 2',
      type: 'CGM & Smartwatch',
      connectionType: 'Cellular LTE-M / BLE',
      status: 'Connected',
      battery: 64,
      signalStrength: -65,
      lastSync: new Date().toISOString(),
      currentVitals: {
        heartRate: 86,
        spO2: 96,
        bpSys: 138,
        bpDia: 88,
        temperature: 37.1,
        bloodGlucose: 154,
        respirationRate: 18
      },
      alertThresholds: {
        hrMax: 115,
        hrMin: 50,
        spo2Min: 92,
        glucoseMax: 180,
        glucoseMin: 70
      }
    }
  ],
  iotTelemetryLogs: [
    { timestamp: '10:00 AM', heartRate: 72, spO2: 98, bpSys: 120, bpDia: 78, bloodGlucose: 98 },
    { timestamp: '11:00 AM', heartRate: 75, spO2: 99, bpSys: 122, bpDia: 80, bloodGlucose: 102 },
    { timestamp: '12:00 PM', heartRate: 82, spO2: 98, bpSys: 126, bpDia: 82, bloodGlucose: 128 },
    { timestamp: '01:00 PM', heartRate: 78, spO2: 98, bpSys: 124, bpDia: 80, bloodGlucose: 118 },
    { timestamp: '02:00 PM', heartRate: 73, spO2: 97, bpSys: 121, bpDia: 79, bloodGlucose: 106 },
    { timestamp: '03:00 PM', heartRate: 76, spO2: 98, bpSys: 123, bpDia: 81, bloodGlucose: 105 }
  ],
  iotAlerts: [
    {
      id: 'alt_101',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      deviceId: 'iot_dev_2',
      vitalType: 'Blood Glucose',
      value: '154 mg/dL',
      threshold: '140 mg/dL target',
      severity: 'Moderate',
      status: 'Monitored',
      triggeredAt: '2026-10-15T14:15:00Z',
      actionTaken: 'Patient mobile alert dispatched: drink water and log insulin.'
    }
  ],
  emrNetworkHospitals: [
    {
      id: 'hosp_central',
      name: 'MediNova Central Medical Center',
      networkNode: 'NODE-US-EAST-01',
      city: 'Central City, NY',
      fhirEndpoint: 'https://fhir.medinova-health.net/r4',
      status: 'Active (Primary Hub)',
      certifiedSince: '2023',
      tlsVersion: 'TLS 1.3 / Mutual Auth',
      recordsAvailable: 1420
    },
    {
      id: 'hosp_stjude',
      name: 'Saint Jude Regional Trauma & Surgery Center',
      networkNode: 'NODE-US-EAST-04',
      city: 'Westside Heights, NY',
      fhirEndpoint: 'https://fhir.stjude-trauma.org/v4',
      status: 'Connected',
      certifiedSince: '2024',
      tlsVersion: 'TLS 1.3 / FHIR Compliant',
      recordsAvailable: 840
    },
    {
      id: 'hosp_metro',
      name: 'Metro General University Hospital',
      networkNode: 'NODE-US-METRO-02',
      city: 'Metro Plaza, NY',
      fhirEndpoint: 'https://hie.metrogeneral.edu/api/fhir',
      status: 'Connected',
      certifiedSince: '2022',
      tlsVersion: 'TLS 1.3 / FHIR Compliant',
      recordsAvailable: 2150
    },
    {
      id: 'hosp_apollo',
      name: 'Hopkins Affiliate Specialized Cardiac Center',
      networkNode: 'NODE-US-CARDIO-08',
      city: 'South Valley, NY',
      fhirEndpoint: 'https://interop.hopkinscardio.org/fhir',
      status: 'Connected',
      certifiedSince: '2025',
      tlsVersion: 'TLS 1.3 / FHIR Compliant',
      recordsAvailable: 620
    }
  ],
  emrExchangeRecords: [
    {
      id: 'fhir_rec_881',
      nationalHealthId: 'NHID-8802-991A',
      patientName: 'Sarah Jenkins',
      patientDob: '1992-04-14',
      sourceHospitalId: 'hosp_metro',
      sourceHospitalName: 'Metro General University Hospital',
      destinationHospitalName: 'MediNova Central Medical Center',
      exchangeType: 'Inbound Query',
      documentType: 'Surgical Operative Summary & Pathology',
      date: '2024-03-12',
      clinicalSummary: 'Laparoscopic appendectomy performed under general anesthesia. No intraoperative complications. Pathology benign appendix.',
      allergiesConfirmed: ['Penicillin (Hives)', 'Sulfa Drugs (Mild rash)'],
      medicationsAtDischarge: ['Ibuprofen 400mg PRN', 'Acetaminophen 500mg'],
      verifiedByDoctor: 'Dr. Katherine Bell, FACS',
      fhirSha256Hash: '9f8e4a7b2c1d6e3f5a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
      importStatus: 'Ready to Import'
    },
    {
      id: 'fhir_rec_882',
      nationalHealthId: 'NHID-4401-229B',
      patientName: 'John Doe',
      patientDob: '1968-09-22',
      sourceHospitalId: 'hosp_stjude',
      sourceHospitalName: 'Saint Jude Regional Trauma Center',
      destinationHospitalName: 'MediNova Central Medical Center',
      exchangeType: 'Inbound Query',
      documentType: 'Diagnostic MRI Lumbar Spine & Echo Report',
      date: '2025-01-20',
      clinicalSummary: 'L4-L5 mild degenerative disc disease without neural impingement. Echocardiogram shows LVEF 58%, normal left ventricular systolic function.',
      allergiesConfirmed: ['No Known Drug Allergies (NKDA)'],
      medicationsAtDischarge: ['Metformin 500mg BID', 'Lisinopril 10mg QD'],
      verifiedByDoctor: 'Dr. Gregory House, MD',
      fhirSha256Hash: '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
      importStatus: 'Imported into Central EMR'
    }
  ],
  emrExchangeAuditLog: [
    {
      id: 'audit_fhir_101',
      timestamp: '2026-10-14T09:20:00Z',
      direction: 'OUTBOUND_DISPATCH',
      sourceFacility: 'MediNova Central Medical Center',
      targetFacility: 'Saint Jude Regional Trauma & Surgery Center',
      patientName: 'John Doe',
      nationalHealthId: 'NHID-4401-229B',
      payloadType: 'Continuity of Care Document (CCD / FHIR Bundle)',
      authorizedDoctor: 'Dr. Marcus Vance',
      status: 'Cryptographically Verified (SHA-256)'
    },
    {
      id: 'audit_fhir_102',
      timestamp: '2026-10-15T11:45:00Z',
      direction: 'INBOUND_IMPORT',
      sourceFacility: 'Metro General University Hospital',
      targetFacility: 'MediNova Central Medical Center',
      patientName: 'Sarah Jenkins',
      nationalHealthId: 'NHID-8802-991A',
      payloadType: 'Operative & Pathology FHIR Resource',
      authorizedDoctor: 'Dr. Marcus Vance',
      status: 'Cryptographically Verified (SHA-256)'
    }
  ],
  genomicProfiles: [
    {
      id: 'gnm_prof_01',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      sampleId: 'DNA-SEQ-2026-9921',
      sequencingDate: '2026-09-18',
      sequencingMethod: 'Illumina NovaSeq 6000 Whole Exome + Target Oncology Panel (120x)',
      qualityScore: 'Q30 > 96.8% (Clinical Grade)',
      polygenicRiskScores: [
        { condition: 'Cardiovascular Atherosclerosis', percentile: 78, riskCategory: 'Elevated Risk', baselinePopRisk: 22, relativeMultiplier: 1.8, recommendation: 'Intensify ApoB monitoring and initiate preventative statin titration.' },
        { condition: 'Hereditary Breast & Ovarian Cancer', percentile: 34, riskCategory: 'Average Population Risk', baselinePopRisk: 12, relativeMultiplier: 1.0, recommendation: 'Continue standard biennial mammography protocols.' },
        { condition: 'Type 2 Diabetes Mellitus', percentile: 86, riskCategory: 'High Risk', baselinePopRisk: 14, relativeMultiplier: 2.4, recommendation: 'Continuous glucose trend monitoring; early low-glycemic dietary prescription.' },
        { condition: 'Late-Onset Alzheimer Disease', percentile: 42, riskCategory: 'Normal Risk', baselinePopRisk: 10, relativeMultiplier: 1.1, recommendation: 'Standard cognitive baseline checks at age 50.' },
        { condition: 'Primary Open-Angle Glaucoma', percentile: 19, riskCategory: 'Low Risk', baselinePopRisk: 5, relativeMultiplier: 0.6, recommendation: 'Routine ocular pressure check at regular optometry exams.' }
      ],
      detectedVariants: [
        {
          gene: 'CYP2C19',
          variantId: 'rs4244285 (*2)',
          hgvs: 'c.681G>A (p.Pro227=)',
          zygosity: 'Heterozygous (*1/*2)',
          acmgClassification: 'Pathogenic for Altered Metabolism',
          clinicalSignificance: 'Intermediate Metabolizer for Clopidogrel and Escitalopram',
          actionableGuideline: 'Antiplatelet therapy: consider alternative agent (Ticagrelor or Prasugrel) due to reduced active metabolite formation.'
        },
        {
          gene: 'LDLR',
          variantId: 'rs121908028',
          hgvs: 'c.2054C>T (p.Pro685Leu)',
          zygosity: 'Heterozygous',
          acmgClassification: 'Likely Pathogenic',
          clinicalSignificance: 'Familial Hypercholesterolemia Susceptibility',
          actionableGuideline: 'Target LDL-C reduction < 70 mg/dL; consider PCSK9 inhibitor adjunctive therapy if baseline statin therapy insufficient.'
        },
        {
          gene: 'TCF7L2',
          variantId: 'rs7903146',
          hgvs: 'Intronic C>T',
          zygosity: 'Homozygous (T/T)',
          acmgClassification: 'Risk Factor Allele',
          clinicalSignificance: 'Impaired Incretin Effect & Reduced Insulin Secretion',
          actionableGuideline: 'Prioritize GLP-1 receptor agonist or SGLT2 inhibitor in glycemic management protocols.'
        }
      ],
      pharmacogenomics: [
        { drug: 'Clopidogrel (Plavix)', gene: 'CYP2C19', phenotype: 'Intermediate Metabolizer', alertLevel: 'Warning', cpicGuideline: 'Avoid standard clopidogrel dosing post-PCI; switch to ticagrelor 90mg BID.' },
        { drug: 'Warfarin', gene: 'VKORC1 / CYP2C9', phenotype: 'Normal Sensitivity', alertLevel: 'Safe', cpicGuideline: 'Standard INR-guided initiation and titration protocol.' },
        { drug: 'Simvastatin', gene: 'SLCO1B1', phenotype: 'Normal Function (*1/*1)', alertLevel: 'Safe', cpicGuideline: 'Standard dosing up to 40mg daily with low myopathy risk.' }
      ],
      clinicalSummary: 'Overall genomic profile demonstrates marked cardiometabolic predisposition with CYP2C19 intermediate metabolizer status requiring precision tailoring of antiplatelet pharmacotherapy.'
    }
  ],
  genomicCatalog: [
    { gene: 'BRCA1', chromosome: '17q21.31', category: 'Hereditary Oncology', description: 'Tumor suppressor involved in DNA double-strand break repair via homologous recombination.' },
    { gene: 'APOE', chromosome: '19q13.32', category: 'Neurogenetics & Lipids', description: 'Major apolipoprotein determining lipid transport and Alzheimer susceptibility alleles (e2, e3, e4).' },
    { gene: 'CYP2C19', chromosome: '10q23.33', category: 'Pharmacogenomics', description: 'Cytochrome P450 enzyme responsible for metabolizing antiplatelet clopidogrel, PPIs, and SSRIs.' },
    { gene: 'SLCO1B1', chromosome: '12p12.1', category: 'Pharmacogenomics', description: 'Organic anion transporter mediating hepatic uptake of statins and methotrexate.' },
    { gene: 'LDLR', chromosome: '19p13.2', category: 'Cardiometabolic', description: 'Low-density lipoprotein receptor maintaining plasma cholesterol homeostasis.' }
  ],
  roboticSuites: [
    {
      id: 'or_suite_4',
      name: 'OR-Suite 4: DaVinci Xi Tele-Surgical Platform',
      specialty: 'Minimally Invasive Cardiothoracic & Urology',
      status: 'Live Tele-Presence Active',
      networkMode: 'Ultra-Reliable Low-Latency Communication (URLLC 5G + Dark Fiber)',
      latencyMs: 3.4,
      jitterMs: 0.2,
      packetLossPercent: 0.00,
      hapticRefreshRateHz: 1000,
      videoStreamFps: 60,
      videoResolution: '4K Ultra-HD Stereoscopic 3D',
      activeSurgeon: 'Dr. Marcus Vance (Remote Console - Mayo Clinic Hub)',
      inRoomSurgeon: 'Dr. Katherine Bell, FACS (Bedside Lead)',
      anesthesiologist: 'Dr. David Lin, MD',
      currentProcedure: 'Robotic Mitral Valve Annuloplasty & Chordal Repair',
      patientName: 'Sarah Jenkins',
      patientId: 'usr_pat_1',
      startTime: '2026-10-16T02:30:00Z',
      durationMinutes: 72,
      safetyInterlock: 'Engaged (Active Guardrails)',
      tremorFilter: 'Active (0.2mm Tremor Cancellation)',
      workspaceBoundaries: 'Calibrated (±0.05mm Anatomical Safe-Zone)',
      arms: [
        { id: 'arm_1', name: 'Master Arm 1 (Endowrist Left)', tool: 'ProGrasp Bipolar Forceps', jointAngleDeg: 42.5, gripForceN: 4.8, status: 'Active Tele-Control', temperatureC: 36.2 },
        { id: 'arm_2', name: 'Master Arm 2 (Endowrist Right)', tool: 'Monopolar Curved Scissor / Electrocautery', jointAngleDeg: 78.1, gripForceN: 2.1, status: 'Active Tele-Control', temperatureC: 37.0 },
        { id: 'arm_3', name: 'Master Arm 3 (Stereoscopic Vision)', tool: 'Dual 4K Endo-Optic 3D Camera', jointAngleDeg: 12.0, gripForceN: 0.0, status: 'Tracking Target Focus', temperatureC: 35.8 },
        { id: 'arm_4', name: 'Master Arm 4 (Vessel Sealer)', tool: 'SynchroSeal Advanced Hemostatic Sealer', jointAngleDeg: 55.4, gripForceN: 6.2, status: 'Standby / Clamped', temperatureC: 36.5 }
      ],
      vitalTelemetry: {
        patientHeartRate: 68,
        arterialBp: '114/72',
        perfusionIndex: 4.2,
        etCO2: 36
      }
    },
    {
      id: 'or_suite_2',
      name: 'OR-Suite 2: CyberArm Micro-Neurosurgical Master',
      specialty: 'Stereotactic Neurosurgery & Micro-Vascular Repair',
      status: 'Standby / Calibrated',
      networkMode: '10Gbps Dedicated Medical Fiber (Redundant Ring)',
      latencyMs: 1.8,
      jitterMs: 0.1,
      packetLossPercent: 0.00,
      hapticRefreshRateHz: 1200,
      videoStreamFps: 60,
      videoResolution: '8K Microscopic 3D Overlay',
      activeSurgeon: 'Dr. Aris Thorne (Local Master Station)',
      inRoomSurgeon: 'Dr. Aris Thorne',
      anesthesiologist: 'Dr. Melissa Ross, MD',
      currentProcedure: 'Scheduled: Microvascular Trigeminal Decompression',
      patientName: 'John Doe',
      patientId: 'usr_pat_2',
      startTime: null,
      durationMinutes: 0,
      safetyInterlock: 'Standby (Pre-Flight Diagnostics Passed)',
      tremorFilter: 'Active (Sub-Millimeter Filtering)',
      workspaceBoundaries: 'Pre-Op MRI Co-Registered',
      arms: [
        { id: 'arm_1', name: 'Arm 1 (Micro-Dissector)', tool: 'Diamond Micro-Knife', jointAngleDeg: 0, gripForceN: 0, status: 'Docked', temperatureC: 24.1 },
        { id: 'arm_2', name: 'Arm 2 (Micro-Suction)', tool: 'Variable Aspiration Cannula', jointAngleDeg: 0, gripForceN: 0, status: 'Docked', temperatureC: 24.0 },
        { id: 'arm_3', name: 'Arm 3 (Neuronavigation Camera)', tool: 'Optical Sensor Array', jointAngleDeg: 0, gripForceN: 0, status: 'Docked', temperatureC: 24.2 }
      ],
      vitalTelemetry: {
        patientHeartRate: 72,
        arterialBp: '120/80',
        perfusionIndex: 4.5,
        etCO2: 35
      }
    }
  ],
  roboticSurgicalLogs: [
    {
      id: 'surg_log_101',
      suiteId: 'or_suite_4',
      timestamp: '2026-10-16T02:45:12Z',
      eventType: 'TELE_CONTROL_ENGAGED',
      surgeon: 'Dr. Marcus Vance',
      details: 'Remote console handshake verified via encrypted 5G slice; control authority transferred to remote console.',
      networkLatency: '3.3ms'
    }
  ],
  quantumNodes: [
    {
      id: 'qkd_node_central',
      name: 'MediNova Central QKD Primary Hub',
      location: 'Central Tower Penthouse Core',
      linkType: 'Entangled Photon Polarization (BB84 / E91 Protocol)',
      physicalMedium: 'Dark Fiber Optical Core 1550nm',
      status: 'Active (QKD Entangled)',
      qberPercent: 1.24,
      qberThreshold: 4.50,
      keyGenRateKbps: 48.6,
      rawPhotonFlux: '1.42 Mphotons/s',
      postQuantumAlgorithm: 'NIST ML-KEM (Kyber-1024) + Dilithium-5',
      sessionKeyId: 'QKEY-KYBER-9941-SECURE',
      keyLifespanSeconds: 300,
      keyTimeRemainingSeconds: 184,
      eavesdropperDetected: false
    },
    {
      id: 'qkd_node_regional',
      name: 'Saint Jude Regional QKD Satellite Node',
      location: 'Westside Heights Interconnect',
      linkType: 'Decoy-State Phase-Coded QKD',
      physicalMedium: 'Protected Metro Underground Conduit',
      status: 'Active (QKD Entangled)',
      qberPercent: 1.48,
      qberThreshold: 4.50,
      keyGenRateKbps: 36.2,
      rawPhotonFlux: '1.10 Mphotons/s',
      postQuantumAlgorithm: 'NIST ML-KEM (Kyber-1024) + Dilithium-5',
      sessionKeyId: 'QKEY-KYBER-8820-STJUDE',
      keyLifespanSeconds: 300,
      keyTimeRemainingSeconds: 242,
      eavesdropperDetected: false
    }
  ],
  quantumTelemetryStream: [
    {
      packetId: 'QPACK-8801',
      timestamp: '2026-10-16T03:30:10Z',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      telemetrySource: 'ICU Cardiac Telemetry & Pulse Oximetry',
      rawPayload: 'HR: 74 bpm | SpO2: 99% | NIBP: 120/80 mmHg | Temp: 36.8C',
      ciphertextHex: '0x4f89d3a17e0b5c92841e7f302b4d6a89c1e3f5b7a0d2e4f681a3b5c7d9e1f3a5',
      encryptionStandard: 'Post-Quantum CRYSTALS-Kyber-1024 Encapsulation',
      signatureAlgorithm: 'CRYSTALS-Dilithium-5 (NIST FIPS 204)',
      qkdEntropyUsed: '256 bits BB84 photon state',
      integrityStatus: 'Quantum Decryption Verified'
    }
  ],
  quantumAuditLog: [
    {
      id: 'qlog_101',
      timestamp: '2026-10-16T02:00:00Z',
      nodeId: 'qkd_node_central',
      eventType: 'KEY_ROTATION_SUCCESS',
      protocol: 'BB84 Quantum Key Distribution',
      details: 'Post-quantum session key regenerated successfully; 48.6 kbps photon entropy generated with QBER 1.24%.'
    }
  ],
  droneFleet: [
    {
      id: 'drn_01',
      callsign: 'AeroMed-X1 (Falcon-Alpha)',
      model: 'MediNova SkyLifter eVTOL Heavy-Lift Carrier',
      status: 'In-Flight Delivery',
      batteryPercent: 84,
      cruisingSpeedKmh: 115,
      altitudeMeters: 120,
      currentLat: 40.7306,
      currentLng: -73.9352,
      distanceRemainingKm: 6.8,
      etaMinutes: 4,
      payloadBayTempC: 3.8,
      payloadBayTargetTemp: '2.0°C - 6.0°C (Cold-Chain Verified)',
      payloadType: '4x Units O-Negative PRBC (Universal Donor)',
      flightCorridor: 'Corridor Alpha (Sub-Orbital Medical Transit)',
      destination: 'Saint Jude Regional Trauma & Surgery Center',
      origin: 'MediNova Central Blood Bank Hub',
      emergencyPriority: 'STAT Life-Threatening Triage'
    },
    {
      id: 'drn_02',
      callsign: 'AeroMed-X2 (Osprey-Bravo)',
      model: 'SkyCourier Micro-Specimen Autonomous Drone',
      status: 'Docked & Rapid-Charging',
      batteryPercent: 96,
      cruisingSpeedKmh: 0,
      altitudeMeters: 0,
      currentLat: 40.7128,
      currentLng: -74.0060,
      distanceRemainingKm: 0,
      etaMinutes: 0,
      payloadBayTempC: 4.1,
      payloadBayTargetTemp: '2.0°C - 6.0°C',
      payloadType: 'Ready for Dispatch / Cryo-Chamber Sanitized',
      flightCorridor: 'Standby Heli-Pad Pad 2',
      destination: 'MediNova Helipad Base',
      origin: 'MediNova Central Base',
      emergencyPriority: 'Standby'
    }
  ],
  droneMissions: [
    {
      id: 'msn_drn_501',
      droneId: 'drn_01',
      droneCallsign: 'AeroMed-X1 (Falcon-Alpha)',
      priority: 'STAT Life-Threatening Triage',
      payload: '4x Units O-Negative Packed Red Blood Cells (PRBC) + 2x Single-Donor Platelets',
      coldChainStatus: 'Active Refrigeration (3.8°C Verified)',
      originHub: 'MediNova Central Blood Bank Hub',
      destinationFacility: 'Saint Jude Regional Trauma & Surgery Center',
      dispatchedAt: '2026-10-16T03:22:00Z',
      flightStatus: 'In-Flight (En Route)',
      totalDistanceKm: 14.5,
      etaMinutes: 4,
      dispatchedBy: 'Elena Gilbert, PharmD'
    }
  ],
  droneAirCorridors: [
    { id: 'corr_alpha', name: 'Corridor Alpha (East River Direct Transit)', altitudeCeilingMeters: 150, maxSpeedKmh: 140, status: 'Active (Clear Skies / 8kt Wind)', airspaceAuth: 'FAA Part 135 Certified Medical BVLOS' },
    { id: 'corr_bravo', name: 'Corridor Bravo (Midtown Expressway Skyway)', altitudeCeilingMeters: 130, maxSpeedKmh: 120, status: 'Active (Clear)', airspaceAuth: 'FAA Part 135 Certified Medical BVLOS' }
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
  },

  // Telemedicine
  getTelemedicineSessions: async () => {
    const db = getLocalStore();
    return { sessions: db.telemedicineSessions || [] };
  },
  bookTelemedicineSession: async (sessionData) => {
    const db = getLocalStore();
    const user = JSON.parse(localStorage.getItem('medinova_demo_user') || '{}');
    const doctor = db.users.find(u => u.id === sessionData.doctorId);
    const newSession = {
      id: 'tele_' + Date.now(),
      patientId: user.id || 'usr_pat_1',
      patientName: user.name || 'Sarah Jenkins',
      patientContact: user.contact || '+1 (555) 234-5678',
      patientAge: user.age || 34,
      doctorId: doctor?.id || sessionData.doctorId,
      doctorName: doctor?.name || 'Dr. Specialist',
      specialty: doctor?.specialty || doctor?.department || 'Cardiology',
      date: sessionData.date,
      timeSlot: sessionData.timeSlot,
      reason: sessionData.reason || 'Virtual Telemedicine Consultation',
      status: 'Scheduled',
      roomId: 'room_' + (doctor?.specialty || 'tele').toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      videoUrl: 'https://medinova.telehealth.live/room_demo',
      notes: '',
      prescription: [],
      createdAt: new Date().toISOString()
    };
    if (!db.telemedicineSessions) db.telemedicineSessions = [];
    db.telemedicineSessions.unshift(newSession);
    saveLocalStore(db);
    return { session: newSession, message: 'Consultation scheduled successfully' };
  },
  updateTelemedicineStatus: async (id, status) => {
    const db = getLocalStore();
    const s = (db.telemedicineSessions || []).find(sess => sess.id === id);
    if (s) {
      s.status = status;
      if (status === 'Completed' && !s.completedAt) s.completedAt = new Date().toISOString();
      saveLocalStore(db);
    }
    return { session: s, message: `Status updated to ${status}` };
  },
  completeTelemedicineSession: async (id, completionData) => {
    const db = getLocalStore();
    const s = (db.telemedicineSessions || []).find(sess => sess.id === id);
    const user = JSON.parse(localStorage.getItem('medinova_demo_user') || '{}');
    if (s) {
      s.status = 'Completed';
      s.notes = completionData.notes || s.notes;
      s.prescription = completionData.prescriptions || [];
      s.completedAt = new Date().toISOString();

      // Auto-create medical record
      const newRec = {
        id: 'rec_' + Date.now(),
        patientId: s.patientId,
        patientName: s.patientName,
        doctorId: s.doctorId || user.id,
        doctorName: s.doctorName || user.name,
        date: new Date().toISOString().split('T')[0],
        diagnosis: completionData.diagnosis || `Virtual Telemedicine: ${s.reason}`,
        symptoms: s.reason,
        prescriptions: completionData.prescriptions || [],
        labResults: 'Telemedicine digital consultation concluded.',
        doctorNotes: completionData.notes || 'Routine consultation complete.'
      };
      if (!db.records) db.records = [];
      db.records.unshift(newRec);
      saveLocalStore(db);
      return { session: s, record: newRec, message: 'Consultation completed and saved to medical records' };
    }
    return { message: 'Session completed' };
  },

  // Pharmacy & Medicine Store
  getMedicines: async (filters = {}) => {
    const db = getLocalStore();
    let list = [...(db.medicines || [])];
    if (filters.category && filters.category !== 'All') {
      list = list.filter(m => m.category.toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    const lowStockCount = list.filter(m => m.stock <= m.reorderLevel).length;
    return {
      medicines: list,
      summary: {
        totalMedicines: (db.medicines || []).length,
        lowStockCount,
        criticalLowCount: list.filter(m => m.stock <= Math.floor(m.reorderLevel * 0.5)).length
      }
    };
  },
  addMedicine: async (medData) => {
    const db = getLocalStore();
    const stock = parseInt(medData.stock, 10) || 0;
    const reorder = parseInt(medData.reorderLevel, 10) || 50;
    const newMed = {
      id: 'med_' + Date.now(),
      name: medData.name,
      category: medData.category,
      dosage: medData.dosage || 'Standard',
      form: medData.form || 'Tablet',
      stock,
      reorderLevel: reorder,
      unitPrice: parseFloat(medData.unitPrice) || 10.0,
      expiryDate: medData.expiryDate || '2028-01-01',
      manufacturer: medData.manufacturer || 'MediNova Pharma',
      status: stock <= 0 ? 'Out of Stock' : (stock <= reorder ? 'Low Stock' : 'In Stock'),
      description: medData.description || ''
    };
    if (!db.medicines) db.medicines = [];
    db.medicines.unshift(newMed);

    // Transaction
    const txn = {
      id: 'txn_' + Date.now(),
      type: 'RESTOCKED',
      medicineId: newMed.id,
      medicineName: newMed.name,
      quantity: stock,
      performedBy: 'Elena Gilbert, PharmD',
      date: new Date().toISOString(),
      notes: 'Initial inventory registration'
    };
    if (!db.pharmacyTransactions) db.pharmacyTransactions = [];
    db.pharmacyTransactions.unshift(txn);
    saveLocalStore(db);
    return { medicine: newMed, message: 'Medicine added successfully' };
  },
  updateMedicineStock: async (id, additionalStock, reason) => {
    const db = getLocalStore();
    const med = (db.medicines || []).find(m => m.id === id);
    if (med) {
      const qty = parseInt(additionalStock, 10) || 0;
      med.stock = Math.max(0, med.stock + qty);
      med.status = med.stock <= 0 ? 'Out of Stock' : (med.stock <= med.reorderLevel ? 'Low Stock' : 'In Stock');
      const txn = {
        id: 'txn_' + Date.now(),
        type: qty >= 0 ? 'RESTOCKED' : 'MANUAL_ADJUSTMENT',
        medicineId: med.id,
        medicineName: med.name,
        quantity: Math.abs(qty),
        performedBy: 'Elena Gilbert, PharmD',
        date: new Date().toISOString(),
        notes: reason || `Stock adjusted by ${qty} units`
      };
      if (!db.pharmacyTransactions) db.pharmacyTransactions = [];
      db.pharmacyTransactions.unshift(txn);
      saveLocalStore(db);
      return { medicine: med, message: 'Stock updated' };
    }
    throw new Error('Medicine not found');
  },
  getPrescriptionsToDispense: async () => {
    const db = getLocalStore();
    const list = [];
    (db.records || []).forEach(record => {
      if (record.prescriptions && Array.isArray(record.prescriptions)) {
        record.prescriptions.forEach((rx, idx) => {
          list.push({
            dispenseId: `${record.id}_rx_${idx}`,
            recordId: record.id,
            patientId: record.patientId,
            patientName: record.patientName,
            doctorName: record.doctorName,
            date: record.date,
            diagnosis: record.diagnosis,
            prescription: rx,
            isDispensed: (db.pharmacyTransactions || []).some(
              t => t.referencePrescriptionId === record.id && t.medicineName?.toLowerCase().includes(rx.name?.toLowerCase())
            )
          });
        });
      }
    });
    return { prescriptions: list };
  },
  dispensePrescription: async (data) => {
    const db = getLocalStore();
    const med = (db.medicines || []).find(m => m.name.toLowerCase().includes(data.medicineName?.toLowerCase()));
    const qty = parseInt(data.quantity, 10) || 30;
    if (med) {
      med.stock = Math.max(0, med.stock - qty);
      med.status = med.stock <= 0 ? 'Out of Stock' : (med.stock <= med.reorderLevel ? 'Low Stock' : 'In Stock');
    }
    const txn = {
      id: 'txn_' + Date.now(),
      type: 'DISPENSED',
      medicineId: med?.id || 'med_dispense',
      medicineName: data.medicineName,
      quantity: qty,
      patientId: data.patientId,
      patientName: data.patientName || 'Patient',
      performedBy: 'Elena Gilbert, PharmD',
      referencePrescriptionId: data.recordId,
      date: new Date().toISOString(),
      notes: `Dispensed per record #${data.recordId}`
    };
    if (!db.pharmacyTransactions) db.pharmacyTransactions = [];
    db.pharmacyTransactions.unshift(txn);
    saveLocalStore(db);
    return { transaction: txn, message: `Dispensed ${data.medicineName} successfully` };
  },
  getPharmacyTransactions: async () => {
    const db = getLocalStore();
    return { transactions: db.pharmacyTransactions || [] };
  },
  getPharmacyOrders: async () => {
    const db = getLocalStore();
    return { orders: db.pharmacyOrders || [] };
  },
  createPharmacyOrder: async (orderData) => {
    const db = getLocalStore();
    const user = JSON.parse(localStorage.getItem('medinova_demo_user') || '{}');
    let total = 0;
    orderData.items.forEach(item => {
      total += (item.unitPrice || 10) * (item.quantity || 1);
      const med = (db.medicines || []).find(m => m.id === item.medicineId);
      if (med) {
        med.stock = Math.max(0, med.stock - (item.quantity || 1));
        med.status = med.stock <= 0 ? 'Out of Stock' : (med.stock <= med.reorderLevel ? 'Low Stock' : 'In Stock');
      }
    });
    const order = {
      id: 'ord_' + Date.now(),
      patientId: user.id || 'usr_pat_1',
      patientName: user.name || 'Sarah Jenkins',
      items: orderData.items,
      totalAmount: parseFloat(total.toFixed(2)),
      status: 'Confirmed & In Transit',
      paymentStatus: 'Paid (Digital Wallet)',
      deliveryAddress: orderData.deliveryAddress || '124 Maple Street, Apt 4B',
      createdAt: new Date().toISOString()
    };
    if (!db.pharmacyOrders) db.pharmacyOrders = [];
    db.pharmacyOrders.unshift(order);
    saveLocalStore(db);
    return { order, message: 'Medicine order confirmed and dispatched!' };
  },

  // Predictive Analytics
  getAnalyticsOverview: async () => {
    const db = getLocalStore();
    const hist = db.analyticsHistorical || {};
    const resUtil = hist.resourceUtilization || {
      totalGeneralBeds: 250, occupiedGeneralBeds: 205,
      totalIcuBeds: 45, occupiedIcuBeds: 40,
      totalVentilators: 20, occupiedVentilators: 15
    };
    return {
      timestamp: new Date().toISOString(),
      advisoryDisclaimer: 'Clinical Advisory Notice: All predictive analytics outputs and risk scorings are statistical estimates generated for decision support. They do not constitute guaranteed outcomes.',
      liveStats: {
        totalPatients: (db.users || []).filter(u => u.role === 'Patient').length,
        totalTriageActive: (db.triageQueue || []).filter(t => t.status === 'Active ER Queue').length,
        criticalTriageCount: (db.triageQueue || []).filter(t => t.priorityResult?.priority === 'Critical').length,
        lowBloodUnitsCount: (db.bloodInventory || []).filter(b => b.units <= b.minThreshold).length,
        lowStockMedsCount: (db.medicines || []).filter(m => m.stock <= m.reorderLevel).length
      },
      historicalAdmissions: hist.weeklyAdmissions || [],
      next7DaysForecast: hist.next7DaysForecast || [],
      resourceUtilization: {
        ...resUtil,
        generalBedRate: Math.round((resUtil.occupiedGeneralBeds / resUtil.totalGeneralBeds) * 100),
        icuBedRate: Math.round((resUtil.occupiedIcuBeds / resUtil.totalIcuBeds) * 100),
        ventilatorRate: Math.round((resUtil.occupiedVentilators / resUtil.totalVentilators) * 100)
      },
      medicineBurnProjections: (db.medicines || []).slice(0, 6).map(m => {
        const dailyBurnRate = Math.max(3, Math.round(m.reorderLevel / 7));
        const days = Math.max(1, Math.round(m.stock / dailyBurnRate));
        return {
          medicineId: m.id, name: m.name, category: m.category, currentStock: m.stock,
          dailyBurnRate, daysUntilStockout: days, urgency: days <= 5 ? 'High Urgency' : days <= 12 ? 'Moderate' : 'Stable'
        };
      }),
      bloodProjections: (db.bloodInventory || []).map(b => {
        const projected = Math.round(b.minThreshold * 1.8);
        const def = projected - b.units;
        return {
          bloodGroup: b.bloodGroup, currentUnits: b.units, projected7DayDemand: projected,
          projectedStatus: def > 0 ? `Deficit (-${def} units)` : `Adequate (+${Math.abs(def)} units)`,
          alertRequired: def > 0
        };
      }),
      aiRecommendations: [
        {
          id: 'rec_ai_1', priority: 'High', department: 'Intensive Care Unit (ICU)',
          message: 'ICU occupancy is at 89% (40/45 beds). Predictive engine estimates threshold saturation in 16 hours. Expedite step-down transfers to HDU.',
          action: 'Trigger ICU De-escalation Protocol'
        },
        {
          id: 'rec_ai_2', priority: 'High', department: 'Pharmacy & Medical Supplies',
          message: 'Critical pharmaceuticals below reorder threshold. Epinephrine auto-injectors and Albuterol inhalers have fewer than 5 days supply.',
          action: 'Initiate Urgent Batch Restock'
        },
        {
          id: 'rec_ai_3', priority: 'Medium', department: 'Blood Bank & Donor Dispatch',
          message: 'Projected 7-day deficit for O- and B- blood units. Urgent donor matching notifications recommended for registered donors within 5 km.',
          action: 'Broadcast Donor Notification'
        },
        {
          id: 'rec_ai_4', priority: 'Medium', department: 'Emergency & Triage Department',
          message: 'Predicted weekend patient influx surge (+28%) due to seasonal meteorological shift. Schedule 3 additional on-call triage physicians.',
          action: 'Roster Additional Staff'
        }
      ]
    };
  },
  simulateScenario: async (scenarioData) => {
    const mult = scenarioData.surgeMultiplier || 1.3;
    const baseOccupied = 205; const totalBeds = 250;
    const baseIcu = 40; const totalIcu = 45;
    const simBeds = Math.round(baseOccupied * mult);
    const simIcu = Math.round(baseIcu * (mult * 1.1));
    return {
      scenario: scenarioData.scenarioType || 'Custom Surge Simulation',
      surgeMultiplier: mult,
      impact: {
        projectedBedDemand: simBeds, bedCapacity: totalBeds, bedDeficit: Math.max(0, simBeds - totalBeds),
        bedSaturationRate: Math.min(100, Math.round((simBeds / totalBeds) * 100)),
        projectedIcuDemand: simIcu, icuCapacity: totalIcu, icuDeficit: Math.max(0, simIcu - totalIcu),
        icuSaturationRate: Math.min(100, Math.round((simIcu / totalIcu) * 100)),
        estimatedAdditionalAmbulancesNeeded: Math.ceil(mult * 3),
        recommendation: simBeds > totalBeds || simIcu > totalIcu
          ? 'CRITICAL BOTTLENECK DETECTED: This surge exceeds hospital capacity. Immediate external triage diversion recommended.'
          : 'MANAGEABLE LOAD: Resources adequate to handle projected volume.'
      }
    };
  },

  // IoT Wearable Vitals
  getIotDevices: async () => {
    const db = getLocalStore();
    return { devices: db.iotDevices || [] };
  },
  pairIotDevice: async (deviceData) => {
    const db = getLocalStore();
    const user = JSON.parse(localStorage.getItem('medinova_demo_user') || '{}');
    const newDev = {
      id: 'iot_dev_' + Date.now(),
      patientId: user.id || 'usr_pat_1',
      patientName: user.name || 'Sarah Jenkins',
      deviceName: deviceData.deviceName,
      model: deviceData.model || 'MediPatch Standard',
      type: deviceData.type || 'Wearable Biosensor',
      connectionType: deviceData.connectionType || 'Bluetooth 5.3 Low Energy',
      status: 'Connected',
      battery: 100,
      signalStrength: -45,
      lastSync: new Date().toISOString(),
      currentVitals: {
        heartRate: 72,
        spO2: 99,
        bpSys: 120,
        bpDia: 80,
        temperature: 36.7,
        bloodGlucose: 100,
        respirationRate: 16
      },
      alertThresholds: { hrMax: 110, hrMin: 50, spo2Min: 94, bpSysMax: 140, bpDiaMax: 90 }
    };
    if (!db.iotDevices) db.iotDevices = [];
    db.iotDevices.unshift(newDev);
    saveLocalStore(db);
    return { device: newDev, message: 'Wearable device paired successfully' };
  },
  updateIotVitals: async (id, vitals) => {
    const db = getLocalStore();
    const dev = (db.iotDevices || []).find(d => d.id === id);
    if (dev) {
      dev.currentVitals = { ...dev.currentVitals, ...vitals };
      dev.lastSync = new Date().toISOString();
      saveLocalStore(db);
      return { device: dev };
    }
    throw new Error('Device not found');
  },
  syncIotDevice: async (id) => {
    const db = getLocalStore();
    const dev = (db.iotDevices || []).find(d => d.id === id);
    if (dev) {
      dev.lastSync = new Date().toISOString();
      dev.currentVitals.heartRate = Math.round(72 + (Math.random() * 8 - 4));
      dev.currentVitals.spO2 = Math.min(100, Math.round(98 + (Math.random() * 2 - 1)));
      saveLocalStore(db);
      return { device: dev, message: 'Synchronized' };
    }
    throw new Error('Device not found');
  },
  disconnectIotDevice: async (id) => {
    const db = getLocalStore();
    db.iotDevices = (db.iotDevices || []).filter(d => d.id !== id);
    saveLocalStore(db);
    return { message: 'Device disconnected' };
  },
  getIotTelemetry: async () => {
    const db = getLocalStore();
    return { telemetryLogs: db.iotTelemetryLogs || [] };
  },
  getIotAlerts: async () => {
    const db = getLocalStore();
    return { alerts: db.iotAlerts || [] };
  },

  // Cross-Hospital EMR Exchange
  getNetworkHospitals: async () => {
    const db = getLocalStore();
    return { hospitals: db.emrNetworkHospitals || [] };
  },
  getExchangeRecords: async (params = {}) => {
    const db = getLocalStore();
    let list = [...(db.emrExchangeRecords || [])];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(r => r.patientName.toLowerCase().includes(q) || r.sourceHospitalName.toLowerCase().includes(q));
    }
    return { records: list };
  },
  importExternalRecord: async (recordId) => {
    const db = getLocalStore();
    const rec = (db.emrExchangeRecords || []).find(r => r.id === recordId);
    if (!rec) throw new Error('External record not found');
    rec.importStatus = 'Imported into Central EMR';

    const newMedRec = {
      id: 'rec_imported_' + Date.now(),
      patientId: 'usr_pat_1',
      patientName: rec.patientName,
      doctorId: 'usr_doc_1',
      doctorName: `Imported from ${rec.sourceHospitalName}`,
      date: rec.date,
      diagnosis: `[Inter-Hospital EMR] ${rec.documentType}`,
      symptoms: rec.clinicalSummary,
      prescriptions: rec.medicationsAtDischarge.map(m => ({ name: m, dosage: 'Discharge Order', frequency: 'Reconciled' })),
      labResults: rec.clinicalSummary,
      doctorNotes: `Cryptographic SHA-256 Verified: ${rec.fhirSha256Hash}`
    };
    if (!db.records) db.records = [];
    db.records.unshift(newMedRec);

    const auditEntry = {
      id: 'audit_fhir_' + Date.now(),
      timestamp: new Date().toISOString(),
      direction: 'INBOUND_IMPORT',
      sourceFacility: rec.sourceHospitalName,
      targetFacility: 'MediNova Central Medical Center',
      patientName: rec.patientName,
      nationalHealthId: rec.nationalHealthId,
      payloadType: rec.documentType,
      authorizedDoctor: 'Attending Physician',
      status: 'Cryptographically Verified (SHA-256)'
    };
    if (!db.emrExchangeAuditLog) db.emrExchangeAuditLog = [];
    db.emrExchangeAuditLog.unshift(auditEntry);
    saveLocalStore(db);
    return { message: 'Record imported and reconciled into EMR', importedRecord: newMedRec };
  },
  dispatchTransferDossier: async (dispatchData) => {
    const db = getLocalStore();
    const user = JSON.parse(localStorage.getItem('medinova_demo_user') || '{}');
    const hospital = (db.emrNetworkHospitals || []).find(h => h.id === dispatchData.targetHospitalId);
    const auditEntry = {
      id: 'fhir_out_' + Date.now(),
      timestamp: new Date().toISOString(),
      direction: 'OUTBOUND_DISPATCH',
      sourceFacility: 'MediNova Central Medical Center',
      targetFacility: hospital ? hospital.name : 'Regional Trauma Center',
      patientName: 'Sarah Jenkins',
      nationalHealthId: 'NHID-8802-991A',
      payloadType: 'Continuity of Care Document (CCD / FHIR Bundle)',
      authorizedDoctor: user.name || 'Dr. Marcus Vance',
      status: 'Cryptographically Verified (SHA-256)'
    };
    if (!db.emrExchangeAuditLog) db.emrExchangeAuditLog = [];
    db.emrExchangeAuditLog.unshift(auditEntry);
    saveLocalStore(db);
    return { message: 'Transfer dossier dispatched successfully', dossier: auditEntry };
  },
  getExchangeAuditLog: async () => {
    const db = getLocalStore();
    return { auditLog: db.emrExchangeAuditLog || [] };
  },

  // Genomic Risk Profiling & Pharmacogenomics
  getGenomicProfiles: async () => {
    const db = getLocalStore();
    return { profiles: db.genomicProfiles || [] };
  },
  getPatientGenomicProfile: async (patientId) => {
    const db = getLocalStore();
    const prof = (db.genomicProfiles || []).find(p => p.patientId === patientId);
    return { profile: prof || (db.genomicProfiles && db.genomicProfiles[0]) };
  },
  analyzeGenomicPanel: async (data) => {
    const db = getLocalStore();
    const patient = db.users.find(u => u.id === data.patientId) || { name: 'Sarah Jenkins', id: 'usr_pat_1' };
    const newProfile = {
      id: 'gnm_prof_' + Date.now(),
      patientId: patient.id,
      patientName: patient.name,
      sampleId: 'DNA-SEQ-' + Date.now().toString().slice(-4),
      sequencingDate: new Date().toISOString().split('T')[0],
      sequencingMethod: data.panelType || 'Next-Generation Whole Exome Sequencing (100x)',
      qualityScore: 'Q30 > 98.4% (Clinical Grade)',
      polygenicRiskScores: [
        { condition: 'Cardiovascular Atherosclerosis', percentile: 72, riskCategory: 'Elevated Risk', baselinePopRisk: 22, relativeMultiplier: 1.8, recommendation: 'Intensify ApoB monitoring and preventative statin titration.' },
        { condition: 'Type 2 Diabetes Mellitus', percentile: 84, riskCategory: 'High Risk', baselinePopRisk: 14, relativeMultiplier: 2.3, recommendation: 'Continuous glucose trend monitoring.' },
        { condition: 'Hereditary Breast & Ovarian Cancer', percentile: 30, riskCategory: 'Average Population Risk', baselinePopRisk: 12, relativeMultiplier: 1.0, recommendation: 'Standard screening protocols.' }
      ],
      detectedVariants: [
        { gene: 'CYP2C19', variantId: 'rs4244285 (*2)', hgvs: 'c.681G>A', zygosity: 'Heterozygous (*1/*2)', acmgClassification: 'Pathogenic for Altered Metabolism', clinicalSignificance: 'Intermediate Metabolizer', actionableGuideline: 'Prescribe alternative P2Y12 antiplatelet (Ticagrelor).' },
        { gene: 'LDLR', variantId: 'rs121908028', hgvs: 'c.2054C>T', zygosity: 'Heterozygous', acmgClassification: 'Likely Pathogenic', clinicalSignificance: 'Familial Hypercholesterolemia Susceptibility', actionableGuideline: 'Target LDL-C < 70 mg/dL.' }
      ],
      pharmacogenomics: [
        { drug: 'Clopidogrel (Plavix)', gene: 'CYP2C19', phenotype: 'Intermediate Metabolizer', alertLevel: 'Warning', cpicGuideline: 'Switch to ticagrelor.' },
        { drug: 'Warfarin', gene: 'VKORC1 / CYP2C9', phenotype: 'Normal Sensitivity', alertLevel: 'Safe', cpicGuideline: 'Standard titration.' }
      ],
      clinicalSummary: 'Precision genomic analysis completed. High cardiometabolic polygenic risk score with actionable CYP2C19 variant.'
    };
    if (!db.genomicProfiles) db.genomicProfiles = [];
    db.genomicProfiles.unshift(newProfile);
    saveLocalStore(db);
    return { message: 'Genomic panel sequenced and analyzed successfully.', profile: newProfile };
  },
  checkPharmacogenomics: async (data) => {
    const drug = data.drugName ? data.drugName.toLowerCase() : '';
    let level = 'Safe';
    let alert = 'No pharmacogenomic contraindications detected for this drug in CPIC databases.';
    let gene = 'CYP450 General';
    let phenotype = 'Extensive (Normal) Metabolizer';

    if (drug.includes('clopidogrel') || drug.includes('plavix')) {
      level = 'Warning';
      alert = 'Intermediate Metabolizer (*1/*2). Diminished antiplatelet response. Consider Ticagrelor or Prasugrel.';
      gene = 'CYP2C19';
      phenotype = 'Intermediate Metabolizer';
    } else if (drug.includes('simvastatin')) {
      level = 'Danger';
      alert = 'SLCO1B1 *5 carrier. Severe risk of statin-induced myopathy. Substitute with Rosuvastatin.';
      gene = 'SLCO1B1';
      phenotype = 'Decreased Transporter Function';
    } else if (drug.includes('codeine')) {
      level = 'Warning';
      alert = 'CYP2D6 polymorphism may alter morphine activation.';
      gene = 'CYP2D6';
      phenotype = 'Intermediate Metabolizer';
    }

    return {
      drug: data.drugName,
      gene,
      phenotype,
      alertLevel: level,
      recommendation: alert,
      evidenceLevel: 'CPIC Level A (Clinical Action Recommended)'
    };
  },
  getGenomicCatalog: async () => {
    const db = getLocalStore();
    return { catalog: db.genomicCatalog || [] };
  },

  // Robotic Surgical Tele-Presence
  getRoboticSuites: async () => {
    const db = getLocalStore();
    return { suites: db.roboticSuites || [] };
  },
  getRoboticSuiteDetail: async (id) => {
    const db = getLocalStore();
    const suite = (db.roboticSuites || []).find(s => s.id === id);
    return { suite: suite || (db.roboticSuites && db.roboticSuites[0]) };
  },
  switchRoboticControl: async (id, mode) => {
    const db = getLocalStore();
    const suite = (db.roboticSuites || []).find(s => s.id === id);
    if (suite) {
      suite.status = mode === 'remote' ? 'Live Tele-Presence Active' : 'Bedside Manual Override Active';
    }
    saveLocalStore(db);
    return { message: `Control switched to ${mode}`, suite };
  },
  calibrateRoboticSuite: async (id) => {
    const db = getLocalStore();
    const suite = (db.roboticSuites || []).find(s => s.id === id);
    if (suite) {
      suite.latencyMs = 3.2;
      suite.jitterMs = 0.15;
      suite.safetyInterlock = 'Calibrated & Arm Safe-Zone Locked';
    }
    saveLocalStore(db);
    return { message: 'Calibration synchronized successfully', suite };
  },
  emergencyStopRoboticSuite: async (id) => {
    const db = getLocalStore();
    const suite = (db.roboticSuites || []).find(s => s.id === id);
    if (suite) {
      suite.status = 'EMERGENCY SOFT-STOP ENGAGED';
      suite.safetyInterlock = 'HALTED (All Instrument Joints Clamped & Locked)';
    }
    saveLocalStore(db);
    return { message: 'Emergency soft-stop triggered', suite };
  },
  scheduleRoboticSurgery: async (data) => {
    const db = getLocalStore();
    const suite = (db.roboticSuites || []).find(s => s.id === data.suiteId) || db.roboticSuites[0];
    const patient = db.users.find(u => u.id === data.patientId) || { name: 'Sarah Jenkins', id: 'usr_pat_1' };
    suite.currentProcedure = data.procedureName || 'Robotic Minimally Invasive Operation';
    suite.patientName = patient.name;
    suite.status = 'Scheduled / Tele-Presence Calibrated';
    saveLocalStore(db);
    return { message: 'Surgery scheduled successfully', suite };
  },
  getRoboticSurgicalLogs: async () => {
    const db = getLocalStore();
    return { logs: db.roboticSurgicalLogs || [] };
  },

  // Quantum-Encrypted Telemetry
  getQuantumNodes: async () => {
    const db = getLocalStore();
    return { nodes: db.quantumNodes || [] };
  },
  getQuantumTelemetryStream: async () => {
    const db = getLocalStore();
    return { stream: db.quantumTelemetryStream || [] };
  },
  rotateQuantumKeys: async (data) => {
    const db = getLocalStore();
    const node = (db.quantumNodes || []).find(n => n.id === (data?.nodeId || 'qkd_node_central'));
    if (node) {
      node.sessionKeyId = 'QKEY-KYBER-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-SECURE';
      node.keyTimeRemainingSeconds = 300;
      node.qberPercent = 1.25;
      node.eavesdropperDetected = false;
      node.status = 'Active (QKD Entangled)';
    }
    saveLocalStore(db);
    return { message: 'Quantum session keys regenerated and rotated successfully.', node };
  },
  simulateQuantumBreach: async (data) => {
    const db = getLocalStore();
    const node = (db.quantumNodes || []).find(n => n.id === (data?.nodeId || 'qkd_node_central'));
    if (node) {
      node.qberPercent = 14.82;
      node.eavesdropperDetected = true;
      node.status = 'ALERT: Quantum State Collapse / Potential Intercept';
    }
    saveLocalStore(db);
    return { message: 'Simulated eavesdropper detected! Entanglement decoherence triggered.', node };
  },
  resetQuantumBreach: async (data) => {
    const db = getLocalStore();
    const node = (db.quantumNodes || []).find(n => n.id === (data?.nodeId || 'qkd_node_central'));
    if (node) {
      node.qberPercent = 1.22;
      node.eavesdropperDetected = false;
      node.status = 'Active (QKD Entangled)';
    }
    saveLocalStore(db);
    return { message: 'Quantum link restored cleanly.', node };
  },
  getQuantumAuditLog: async () => {
    const db = getLocalStore();
    return { auditLog: db.quantumAuditLog || [] };
  },

  // Autonomous Drone Blood Dispatch
  getDroneFleet: async () => {
    const db = getLocalStore();
    return { fleet: db.droneFleet || [] };
  },
  getDroneMissions: async () => {
    const db = getLocalStore();
    return { missions: db.droneMissions || [] };
  },
  getDroneCorridors: async () => {
    const db = getLocalStore();
    return { corridors: db.droneAirCorridors || [] };
  },
  dispatchDroneMission: async (data) => {
    const db = getLocalStore();
    const drone = (db.droneFleet || []).find(d => d.id === data.droneId) || db.droneFleet[0];
    drone.status = 'In-Flight Delivery';
    drone.destination = data.destinationFacility;
    drone.payloadType = data.payload;
    drone.emergencyPriority = data.priority || 'STAT Life-Threatening Triage';
    const newMission = {
      id: 'msn_drn_' + Date.now(),
      droneId: drone.id,
      droneCallsign: drone.callsign,
      priority: drone.emergencyPriority,
      payload: data.payload,
      coldChainStatus: 'Active Refrigeration (3.8°C Verified)',
      originHub: 'MediNova Central Blood Bank Hub',
      destinationFacility: data.destinationFacility,
      dispatchedAt: new Date().toISOString(),
      flightStatus: 'In-Flight (En Route)',
      totalDistanceKm: 12.5,
      etaMinutes: 5,
      dispatchedBy: 'MediNova Dispatch Admin'
    };
    if (!db.droneMissions) db.droneMissions = [];
    db.droneMissions.unshift(newMission);
    saveLocalStore(db);
    return { message: `Autonomous medical drone ${drone.callsign} launched successfully.`, mission: newMission, drone };
  },
  commandDroneRTH: async (id) => {
    const db = getLocalStore();
    const drone = (db.droneFleet || []).find(d => d.id === id);
    if (drone) {
      drone.status = 'Returning to Base (RTH)';
      drone.destination = 'MediNova Central Blood Bank Hub';
    }
    saveLocalStore(db);
    return { message: `Return to home engaged for ${drone ? drone.callsign : id}`, drone };
  },
  checkDronePayloadTemp: async (id) => {
    const db = getLocalStore();
    const drone = (db.droneFleet || []).find(d => d.id === id);
    return {
      droneId: id,
      callsign: drone ? drone.callsign : 'Medical Drone',
      currentTemperatureC: 3.8,
      targetRange: '2.0°C - 6.0°C',
      isCompliant: true,
      sensorStatus: 'Active Dual Redundant Cryo-Sensors'
    };
  },

  // AI-Assisted Medical Image Analysis
  getImagingStudies: async () => {
    const db = getLocalStore();
    return { studies: db.medicalImagingStudies || [] };
  },
  getImagingStudyDetail: async (id) => {
    const db = getLocalStore();
    const study = (db.medicalImagingStudies || []).find(s => s.id === id);
    return { study: study || db.medicalImagingStudies[0] };
  },
  analyzeMedicalImage: async (data) => {
    const db = getLocalStore();
    const newStudy = {
      id: 'img_std_' + Date.now(),
      patientId: data.patientId || 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      modality: data.modality || 'Digital Radiograph',
      studyDate: new Date().toISOString().split('T')[0],
      bodyPart: data.bodyPart || 'Thorax / Chest',
      status: 'AI Analyzed & Verified',
      aiModel: 'DenseNet-121 DeepPath Thoracic Classifier',
      confidenceScore: 96.8,
      primaryFinding: 'Clear Lung Parenchyma with Normal Cardiac Diameter',
      severity: 'Normal / Negative',
      findingsSummary: 'Deep learning neural evaluation reveals symmetric lung volumes without focal airspace consolidation.',
      recommendedAction: 'Standard preventative wellness monitoring.',
      radiologistSignOff: 'AI Diagnostic Inference - Signed by Attending Physician',
      anomalyBoundingBox: { x: 50, y: 55, width: 25, height: 20 }
    };
    if (!db.medicalImagingStudies) db.medicalImagingStudies = [];
    db.medicalImagingStudies.unshift(newStudy);
    saveLocalStore(db);
    return { message: 'Image analyzed by AI deep learning diagnostic pipeline.', study: newStudy };
  },
  reviewImagingStudy: async (id, data) => {
    const db = getLocalStore();
    const study = (db.medicalImagingStudies || []).find(s => s.id === id);
    if (study) {
      study.status = data.status || 'Verified by Radiologist';
      study.radiologistSignOff = 'Dr. Gregory House, MD (Attending Radiologist)';
    }
    saveLocalStore(db);
    return { message: 'Radiological study verified.', study };
  },

  // Voice-Enabled Healthcare Assistant
  processVoiceCommand: async (prompt) => {
    const db = getLocalStore();
    const logEntry = {
      id: 'vcmd_' + Date.now(),
      timestamp: new Date().toISOString(),
      spokenPrompt: prompt,
      detectedIntent: 'CLINICAL_VOICE_QUERY',
      extractedEntities: { query: prompt },
      aiSystemResponse: `Processed clinical voice prompt: "${prompt}". System operational and synchronized with clinical records.`,
      executedAction: 'Voice command executed'
    };
    if (!db.voiceCommandsLog) db.voiceCommandsLog = [];
    db.voiceCommandsLog.unshift(logEntry);
    saveLocalStore(db);
    return { message: 'Voice command processed.', commandLog: logEntry };
  },
  getVoiceHistory: async () => {
    const db = getLocalStore();
    return { history: db.voiceCommandsLog || [] };
  },

  // Multilingual Healthcare Assistance
  getLanguages: async () => {
    return {
      languages: [
        { code: 'es', name: 'Spanish (Español)', native: 'Español' },
        { code: 'hi', name: 'Hindi (हिन्दी)', native: 'हिन्दी' },
        { code: 'zh', name: 'Mandarin (中文)', native: '中文' },
        { code: 'fr', name: 'French (Français)', native: 'Français' },
        { code: 'ar', name: 'Arabic (العربية)', native: 'العربية' }
      ]
    };
  },
  translateClinicalDialogue: async (data) => {
    const db = getLocalStore();
    const record = {
      id: 'trans_' + Date.now(),
      timestamp: new Date().toISOString(),
      patientName: 'Consulting Patient',
      sourceLanguage: data.sourceLanguage || 'Spanish',
      targetLanguage: data.targetLanguage || 'English',
      sourceText: data.sourceText,
      translatedText: `[Clinical Translation]: "${data.sourceText}" mapped to standard clinical medical terminology.`,
      clinicalTerminologyExtracted: ['Clinical Symptom Concordance Verified'],
      speakerType: data.speakerType || 'Patient'
    };
    if (!db.multilingualTranslations) db.multilingualTranslations = [];
    db.multilingualTranslations.unshift(record);
    saveLocalStore(db);
    return { message: 'Translation completed.', translation: record };
  },
  getTranslationHistory: async () => {
    const db = getLocalStore();
    return { history: db.multilingualTranslations || [] };
  },

  // Advanced Hospital Bed & ICU Management
  getHospitalWards: async () => {
    const db = getLocalStore();
    return { wards: db.hospitalWards || [] };
  },
  assignPatientBed: async (data) => {
    const db = getLocalStore();
    const ward = (db.hospitalWards || []).find(w => w.id === data.wardId) || db.hospitalWards[0];
    const bed = ward.beds.find(b => b.id === data.bedId) || ward.beds[0];
    bed.status = 'Occupied';
    bed.patientName = 'Admitted Patient';
    bed.patientId = data.patientId || 'usr_pat_1';
    bed.diagnosis = data.diagnosis || 'Clinical Care';
    saveLocalStore(db);
    return { message: 'Patient assigned to bed.', bed, ward };
  },
  dischargePatientBed: async (data) => {
    const db = getLocalStore();
    const ward = (db.hospitalWards || []).find(w => w.id === data.wardId) || db.hospitalWards[0];
    const bed = ward.beds.find(b => b.id === data.bedId) || ward.beds[0];
    bed.status = 'Sanitizing / Turnover';
    bed.patientName = null;
    saveLocalStore(db);
    return { message: 'Patient discharged. Bed marked for turnover.', bed, ward };
  },
  sanitizeBed: async (data) => {
    const db = getLocalStore();
    const ward = (db.hospitalWards || []).find(w => w.id === data.wardId) || db.hospitalWards[0];
    const bed = ward.beds.find(b => b.id === data.bedId) || ward.beds[0];
    bed.status = 'Available / Clean';
    saveLocalStore(db);
    return { message: 'Bed sanitized and ready for intake.', bed, ward };
  },

  // Smart Insurance Integration & Automated Claims
  getInsurancePolicies: async () => {
    const db = getLocalStore();
    return { policies: db.insurancePolicies || [] };
  },
  getInsuranceClaims: async () => {
    const db = getLocalStore();
    return { claims: db.insuranceClaims || [] };
  },
  verifyInsuranceEligibility: async (data) => {
    return {
      verified: true,
      policyNumber: data.policyNumber || 'BCBS-994821-X',
      payerName: data.payerName || 'BlueCross BlueShield',
      coverageStatus: 'Active & In-Force',
      annualDeductible: 1500,
      deductibleMet: 1250,
      copayOfficeVisit: 25,
      coinsurance: '10%',
      outOfPocketMax: 4000
    };
  },
  submitInsuranceClaim: async (data) => {
    const db = getLocalStore();
    const amount = parseFloat(data.billedAmount) || 350;
    const newClaim = {
      id: 'clm_' + Date.now(),
      patientId: data.patientId || 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      payerName: 'BlueCross BlueShield',
      serviceDate: new Date().toISOString().split('T')[0],
      icd10Diagnosis: data.icd10Diagnosis || 'Z00.00 General medical exam',
      cptProcedure: data.cptProcedure || '99213 Outpatient visit',
      totalBilledAmount: amount,
      coveredAmount: amount * 0.85,
      patientCopayDue: amount * 0.15,
      status: 'Adjudicated & Approved',
      adjudicationDate: new Date().toISOString().split('T')[0],
      authorizationCode: 'AUTH-EDI-' + Date.now().toString().slice(-5)
    };
    if (!db.insuranceClaims) db.insuranceClaims = [];
    db.insuranceClaims.unshift(newClaim);
    saveLocalStore(db);
    return { message: 'Claim submitted and adjudicated.', claim: newClaim };
  },

  // Neural BCI & Nano-Robotics
  getBciSessions: async () => {
    const db = getLocalStore();
    return { sessions: db.neuralBciSessions || [] };
  },
  calibrateBciSensor: async (data) => {
    const db = getLocalStore();
    const newSession = {
      id: 'bci_ses_' + Date.now(),
      patientId: data.patientId || 'usr_pat_2',
      patientName: 'John Doe',
      condition: 'Post-Stroke Motor Cortex Rehabilitation',
      bciArrayType: 'High-Density 64-Channel Sensor Array',
      samplingRateHz: 2048,
      decodingAccuracyPercent: 95.2,
      muBetaRhythmSuppression: 'Active ERD (-4.0 dB)',
      sessionDate: new Date().toISOString().split('T')[0],
      rehabScoreProgress: '+20% Functional Score',
      prostheticGraspIntention: data.taskType || 'Precision Pinch Calibrated'
    };
    if (!db.neuralBciSessions) db.neuralBciSessions = [];
    db.neuralBciSessions.unshift(newSession);
    saveLocalStore(db);
    return { message: 'BCI sensor calibrated.', session: newSession };
  },
  getNanoroboticsSwarms: async () => {
    const db = getLocalStore();
    return { swarms: db.nanoroboticsSwarms || [] };
  },
  steerNanorobotics: async (data) => {
    const db = getLocalStore();
    const swarm = (db.nanoroboticsSwarms || []).find(s => s.id === data.swarmId) || db.nanoroboticsSwarms[0];
    if (swarm) {
      swarm.steeringMethod = 'Magnetic Gradient Resonance (3.5 Tesla)';
      swarm.status = 'Magnetic Field Steered to Target Tissue Margins';
    }
    saveLocalStore(db);
    return { message: 'Nano-robotic magnetic field adjusted.', swarm };
  },

  // Autonomous 3D Bio-Printing
  getBioPrinters: async () => {
    const db = getLocalStore();
    return {
      printers: db.bioPrinters || [
        {
          id: 'bioprint_01',
          name: 'BioMatrix Synthetic Organoid Unit Alpha',
          model: 'MediNova BioMatrix Organoid System X-4',
          status: 'Extruding / Active Synthesis',
          printResolutionMicrons: 10,
          bioInks: [
            { name: 'Collagen Type I Hydrogel', volumeRemainingMl: 85, tempC: 37.0 },
            { name: 'Endothelial Cell Bio-Ink', volumeRemainingMl: 62, tempC: 36.8 },
            { name: 'Cardiomyocyte Precursor Suspension', volumeRemainingMl: 90, tempC: 37.1 }
          ],
          nozzleTemperatureC: 37.1,
          chamberSterility: 'Class 100 Laminar Bio-Enclosure (ISO 5)',
          activeJobId: 'job_bio_01',
          layerCount: 1420,
          currentLayer: 1108
        },
        {
          id: 'bioprint_02',
          name: 'Pneumatic Scaffold Fabricator Beta',
          model: 'MediNova MicroPore OsteoFab 3000',
          status: 'Sterilized & Calibrated (Ready)',
          printResolutionMicrons: 15,
          bioInks: [
            { name: 'Bioactive Glass Hydroxyapatite', volumeRemainingMl: 100, tempC: 22.0 },
            { name: 'GelMA Photo-Crosslinkable Ink', volumeRemainingMl: 95, tempC: 24.5 }
          ],
          nozzleTemperatureC: 24.5,
          chamberSterility: 'Class 100 Laminar Bio-Enclosure (ISO 5)',
          activeJobId: null,
          layerCount: 0,
          currentLayer: 0
        }
      ]
    };
  },
  getBioPrintJobs: async () => {
    const db = getLocalStore();
    return {
      jobs: db.bioPrintJobs || [
        {
          id: 'job_bio_01',
          patientId: 'usr_pat_1',
          patientName: 'Sarah Jenkins',
          organType: 'Vascularized Myocardial Cardiac Patch',
          dimensionsMm: '30 x 30 x 2.5 mm',
          cellViabilityPercent: 96.8,
          extrusionProgressPercent: 78,
          estimatedCompletionMinutes: 14,
          scaffoldMaterial: 'Polycaprolactone (PCL) + GelMA Bio-Ink',
          intendedSurgeon: 'Dr. Marcus Vance (Cardiovascular Surgery)',
          biocompatibilityRating: 'Autologous iPSC Matched (100% HLA Concordance)',
          status: 'In-Progress / Extruding',
          startedAt: new Date().toISOString(),
          microVascularDensity: '840 capillaries/mm²'
        }
      ]
    };
  },
  createBioPrintJob: async (data) => {
    const db = getLocalStore();
    const newJob = {
      id: 'job_bio_' + Date.now(),
      patientId: data.patientId || 'usr_pat_1',
      patientName: data.patientName || 'Sarah Jenkins',
      organType: data.organType,
      dimensionsMm: data.dimensionsMm || '30 x 30 x 2.5 mm',
      cellViabilityPercent: 97.4,
      extrusionProgressPercent: 5,
      estimatedCompletionMinutes: 35,
      scaffoldMaterial: data.scaffoldMaterial || 'Polycaprolactone (PCL) + GelMA Bio-Ink',
      intendedSurgeon: data.intendedSurgeon || 'Dr. Marcus Vance',
      biocompatibilityRating: 'Autologous iPSC Matched (100% HLA Concordance)',
      status: 'In-Progress / Extruding',
      startedAt: new Date().toISOString(),
      microVascularDensity: '860 capillaries/mm²'
    };
    if (!db.bioPrintJobs) db.bioPrintJobs = [];
    db.bioPrintJobs.unshift(newJob);
    saveLocalStore(db);
    return { message: 'Bio-printing synthesis initiated.', job: newJob };
  },
  calibrateBioPrinter: async (id) => {
    return { message: 'Bio-printer nozzle temperature set to 37.0°C and calibrated.' };
  },

  // Deep-Space & Remote Telemetry Relay
  getSpaceNodes: async () => {
    const db = getLocalStore();
    return {
      nodes: db.spaceTelemetryNodes || [
        {
          id: 'space_node_lunar_gateway',
          missionName: 'Deep Space Gateway & Orbital Hab-1',
          orbitType: 'Near-Rectilinear Halo Orbit (NRHO)',
          lightDistanceSeconds: 1.28,
          dtnProtocol: 'Bundle Protocol (RFC 5050 / CCSDS Delay-Tolerant Telemetry)',
          radiationDosimetryMilliSievertsPerDay: 1.42,
          lifeSupportOxygenLevelPercent: 21.2,
          cabinPressureKPa: 101.3,
          telemetrySignalQualityPercent: 99.1,
          autonomousTriageSystemStatus: 'Nominal AI Autonomous Mode Active',
          delayCompensationLatencySec: 2.56,
          stationDoctor: 'Dr. Marcus Vance (Remote Earth Ground Tele-Support)'
        }
      ]
    };
  },
  getSpaceCrewVitals: async () => {
    const db = getLocalStore();
    return {
      crew: db.spaceCrewVitals || [
        {
          id: 'crew_astronaut_01',
          callsign: 'Cmdr. Alex Mercer',
          mission: 'Orbital Hab-1 (NRHO)',
          role: 'Mission Commander & Pilot',
          heartRateBpm: 68,
          bloodPressureSys: 118,
          bloodPressureDia: 76,
          spO2Percent: 99,
          radiationDoseTotalMsv: 18.4,
          boneMineralDensityDelta: '-0.8% (Targeted Resistive Workout Compliant)',
          cognitiveAcuityScore: 98,
          hydrationPercent: 62.4,
          microgravityCardioStatus: 'Compensated (Normal Sinus Rhythm)',
          lastTelemetryTimestamp: new Date().toISOString()
        }
      ]
    };
  },
  pingSpaceTelemetry: async (nodeId) => {
    return {
      message: 'DTN telemetry bundle acknowledged. Ground delay compensation synced.',
      lightDistanceSeconds: 1.28,
      roundTripLatency: 2.56,
      signalStrengthPercent: 99.4
    };
  },
  adjustSpaceLifeSupport: async (data) => {
    const db = getLocalStore();
    const node = (db.spaceTelemetryNodes || [])[0];
    if (node) {
      if (data.oxygenPercent) node.lifeSupportOxygenLevelPercent = parseFloat(data.oxygenPercent);
      if (data.cabinPressureKPa) node.cabinPressureKPa = parseFloat(data.cabinPressureKPa);
      saveLocalStore(db);
    }
    return { message: 'Habitat environmental life support adjusted and verified.' };
  }
};



