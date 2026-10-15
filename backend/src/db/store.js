/**
 * MediNova Data Store & Seed Database
 * Pre-populates all modules so no screen is empty for demo.
 */

import { calculateTriagePriority } from '../utils/triageEngine.js';

export const store = {
  users: [
    {
      id: 'usr_pat_1',
      email: 'patient@medinova.com',
      password: 'password123',
      name: 'Sarah Jenkins',
      role: 'Patient',
      age: 34,
      gender: 'Female',
      contact: '+1 (555) 234-5678',
      bloodGroup: 'O+',
      medicalHistory: 'Mild asthmatic history, allergic to penicillin. Previous appendectomy (2021).',
      emergencyContact: 'Tom Jenkins (Husband) - +1 (555) 998-1122'
    },
    {
      id: 'usr_pat_2',
      email: 'john.doe@medinova.com',
      password: 'password123',
      name: 'John Doe',
      role: 'Patient',
      age: 58,
      gender: 'Male',
      contact: '+1 (555) 876-5432',
      bloodGroup: 'B-',
      medicalHistory: 'Type 2 Diabetes, Hypertension managed with Metformin & Lisinopril.',
      emergencyContact: 'Mary Doe (Wife) - +1 (555) 443-2211'
    },
    {
      id: 'usr_doc_1',
      email: 'doctor@medinova.com',
      password: 'password123',
      name: 'Dr. Marcus Vance',
      role: 'Doctor',
      specialty: 'Cardiology',
      department: 'Cardiovascular Care',
      contact: '+1 (555) 300-1001',
      availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM']
    },
    {
      id: 'usr_doc_2',
      email: 'doctor2@medinova.com',
      password: 'password123',
      name: 'Dr. Elena Rostova',
      role: 'Doctor',
      specialty: 'Neurology',
      department: 'Brain & Spine Institute',
      contact: '+1 (555) 300-1002',
      availableSlots: ['11:00 AM', '01:30 PM', '03:30 PM']
    },
    {
      id: 'usr_doc_3',
      email: 'doctor3@medinova.com',
      password: 'password123',
      name: 'Dr. Arthur Pendelton',
      role: 'Doctor',
      specialty: 'Emergency Medicine',
      department: 'Emergency & Trauma',
      contact: '+1 (555) 300-1003',
      availableSlots: ['08:00 AM', '12:00 PM', '05:00 PM']
    },
    {
      id: 'usr_rec_1',
      email: 'receptionist@medinova.com',
      password: 'password123',
      name: 'David Miller',
      role: 'Receptionist',
      contact: '+1 (555) 400-0010',
      shift: 'Morning (07:00 - 15:00)'
    },
    {
      id: 'usr_drv_1',
      email: 'driver@medinova.com',
      password: 'password123',
      name: 'Robert Taylor',
      role: 'Ambulance Driver',
      contact: '+1 (555) 500-0099',
      vehicleNumber: 'AMB-9021',
      hospitalBase: 'MediNova Central Hub',
      status: 'Available',
      currentLocation: { lat: 40.7128, lng: -74.0060, label: 'Central Hospital Base' }
    },
    {
      id: 'usr_drv_2',
      email: 'driver2@medinova.com',
      password: 'password123',
      name: 'Carlos Mendez',
      role: 'Ambulance Driver',
      contact: '+1 (555) 500-0088',
      vehicleNumber: 'AMB-4040',
      hospitalBase: 'MediNova North Wing',
      status: 'Available',
      currentLocation: { lat: 40.7589, lng: -73.9851, label: 'North Wing Outpost' }
    },
    {
      id: 'usr_bb_1',
      email: 'bloodbank@medinova.com',
      password: 'password123',
      name: 'Dr. Aris Thorne',
      role: 'Blood Bank Admin',
      contact: '+1 (555) 600-0707',
      facility: 'MediNova Regional Transfusion Center'
    },
    {
      id: 'usr_pharm_1',
      email: 'pharmacist@medinova.com',
      password: 'password123',
      name: 'Elena Gilbert, PharmD',
      role: 'Pharmacist',
      contact: '+1 (555) 700-4411',
      license: 'RPH-889021',
      pharmacyBranch: 'MediNova Central Pharmacy'
    },
    {
      id: 'usr_adm_1',
      email: 'admin@medinova.com',
      password: 'password123',
      name: 'Clara Oswald',
      role: 'Admin',
      contact: '+1 (555) 900-0001',
      department: 'Executive Operations'
    }
  ],

  records: [
    {
      id: 'rec_1',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Marcus Vance',
      date: '2026-09-10',
      diagnosis: 'Mild Sinus Tachycardia & Fatigue',
      symptoms: 'Palpitations after exertion, mild insomnia',
      prescriptions: [
        { name: 'Metoprolol', dosage: '25mg', frequency: 'Once daily (Morning)' },
        { name: 'Magnesium Supplement', dosage: '400mg', frequency: 'At bedtime' }
      ],
      labResults: 'ECG normal sinus rhythm. Serum electrolytes within normal limits.',
      doctorNotes: 'Patient advised to reduce caffeine intake and monitor resting heart rate.'
    },
    {
      id: 'rec_2',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Marcus Vance',
      date: '2026-08-28',
      diagnosis: 'Type 2 Diabetes Mellitus Follow-up',
      symptoms: 'Increased thirst, mild peripheral neuropathy in feet',
      prescriptions: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }
      ],
      labResults: 'HbA1c: 7.2%. Fasting Blood Glucose: 138 mg/dL.',
      doctorNotes: 'Encouraged low-glycemic dietary adherence and 30-minute daily walking.'
    }
  ],

  appointments: [
    {
      id: 'apt_1',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Marcus Vance',
      department: 'Cardiology',
      date: '2026-10-15',
      timeSlot: '10:30 AM',
      reason: 'Routine ECG checkup and prescription renewal',
      status: 'Confirmed',
      createdAt: '2026-10-01T10:00:00Z'
    },
    {
      id: 'apt_2',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      doctorId: 'usr_doc_2',
      doctorName: 'Dr. Elena Rostova',
      department: 'Neurology',
      date: '2026-10-16',
      timeSlot: '11:00 AM',
      reason: 'Neuropathy sensory evaluation',
      status: 'Booked',
      createdAt: '2026-10-02T14:30:00Z'
    },
    {
      id: 'apt_3',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      doctorId: 'usr_doc_2',
      doctorName: 'Dr. Elena Rostova',
      department: 'Neurology',
      date: '2026-10-20',
      timeSlot: '01:30 PM',
      reason: 'Migraine consultation',
      status: 'Booked',
      createdAt: '2026-10-05T09:15:00Z'
    }
  ],

  triageQueue: [
    {
      id: 'trg_101',
      patientName: 'Arthur Dent',
      age: 42,
      gender: 'Male',
      contact: '+1 (555) 777-1234',
      symptoms: 'Acute crushing chest pain, diaphoresis, shortness of breath',
      heartRate: 128,
      bpSys: 178,
      bpDia: 102,
      spo2: 89,
      temperature: 37.4,
      priorityResult: calculateTriagePriority({
        age: 42,
        symptoms: ['chest pain', 'shortness of breath'],
        heartRate: 128,
        bpSys: 178,
        bpDia: 102,
        spo2: 89,
        temperature: 37.4
      }),
      status: 'Active ER Queue',
      submittedAt: '2026-10-09T20:15:00Z'
    },
    {
      id: 'trg_102',
      patientName: 'Emily Watson',
      age: 67,
      gender: 'Female',
      contact: '+1 (555) 888-2345',
      symptoms: 'Sudden weakness on left side, speech slurring, dizziness',
      heartRate: 98,
      bpSys: 165,
      bpDia: 95,
      spo2: 94,
      temperature: 36.8,
      priorityResult: calculateTriagePriority({
        age: 67,
        symptoms: ['stroke', 'dizziness'],
        heartRate: 98,
        bpSys: 165,
        bpDia: 95,
        spo2: 94,
        temperature: 36.8
      }),
      status: 'Active ER Queue',
      submittedAt: '2026-10-09T21:00:00Z'
    },
    {
      id: 'trg_103',
      patientName: 'Lucas Vance',
      age: 19,
      gender: 'Male',
      contact: '+1 (555) 333-8899',
      symptoms: 'Right lower quadrant abdominal pain, fever',
      heartRate: 92,
      bpSys: 124,
      bpDia: 80,
      spo2: 98,
      temperature: 38.6,
      priorityResult: calculateTriagePriority({
        age: 19,
        symptoms: ['abdominal pain', 'fever'],
        heartRate: 92,
        bpSys: 124,
        bpDia: 80,
        spo2: 98,
        temperature: 38.6
      }),
      status: 'Triaged',
      submittedAt: '2026-10-09T18:40:00Z'
    }
  ],

  ambulanceRequests: [
    {
      id: 'amb_req_1',
      patientName: 'Arthur Dent',
      contact: '+1 (555) 777-1234',
      pickupLocation: '742 Evergreen Terrace, Sector 4',
      latitude: 40.7306,
      longitude: -73.9352,
      driverId: 'usr_drv_1',
      driverName: 'Robert Taylor',
      vehicleNumber: 'AMB-9021',
      status: 'En route',
      requestedAt: '2026-10-09T21:10:00Z',
      progress: 45 // 45% simulated route completion
    }
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
    {
      id: 'dnr_1',
      name: 'Michael Chang',
      bloodGroup: 'O-',
      age: 29,
      contact: '+1 (555) 111-9988',
      city: 'Downtown Hub (2.1 km away)',
      isAvailable: true,
      lastDonated: '2026-05-14'
    },
    {
      id: 'dnr_2',
      name: 'Rebecca Stone',
      bloodGroup: 'O-',
      age: 35,
      contact: '+1 (555) 222-3344',
      city: 'Westside Heights (4.5 km away)',
      isAvailable: true,
      lastDonated: '2026-04-10'
    },
    {
      id: 'dnr_3',
      name: 'David Beckham',
      bloodGroup: 'B-',
      age: 41,
      contact: '+1 (555) 888-9900',
      city: 'Metro Plaza (3.0 km away)',
      isAvailable: true,
      lastDonated: '2026-06-01'
    },
    {
      id: 'dnr_4',
      name: 'Samantha Ray',
      bloodGroup: 'A-',
      age: 26,
      contact: '+1 (555) 666-4433',
      city: 'East Valley (1.8 km away)',
      isAvailable: true,
      lastDonated: '2026-07-22'
    },
    {
      id: 'dnr_5',
      name: 'Kevin Hart',
      bloodGroup: 'AB-',
      age: 38,
      contact: '+1 (555) 777-6655',
      city: 'Central City (5.2 km away)',
      isAvailable: true,
      lastDonated: '2026-03-18'
    }
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
      status: 'Scheduled', // 'Scheduled', 'In-Progress', 'Completed', 'Cancelled'
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
      notes: 'Patient reports mild tingling in lower extremities during evening hours. Vitals stable.',
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
      notes: 'Consultation conducted via encrypted video stream. Pharyngeal erythema mild, no stridor. Advised oral antihistamine and steam inhalation.',
      prescription: [
        { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily at bedtime', days: '7 days' }
      ],
      createdAt: '2026-10-12T09:00:00Z',
      completedAt: '2026-10-12T12:25:00Z'
    }
  ],

  medicines: [
    {
      id: 'med_1',
      name: 'Metformin Hydrochloride',
      category: 'Diabetes Care',
      dosage: '500mg',
      form: 'Tablet',
      stock: 450,
      reorderLevel: 100,
      unitPrice: 12.50,
      expiryDate: '2027-08-30',
      manufacturer: 'Novartis Pharma',
      status: 'In Stock',
      description: 'First-line medication for the management of type 2 diabetes.'
    },
    {
      id: 'med_2',
      name: 'Metoprolol Tartrate',
      category: 'Cardiovascular',
      dosage: '25mg',
      form: 'Tablet',
      stock: 85,
      reorderLevel: 90,
      unitPrice: 18.20,
      expiryDate: '2027-05-15',
      manufacturer: 'AstraZeneca',
      status: 'Low Stock',
      description: 'Selective beta-blocker for hypertension and angina prophylaxis.'
    },
    {
      id: 'med_3',
      name: 'Amoxicillin Trihydrate',
      category: 'Antibiotics',
      dosage: '500mg',
      form: 'Capsule',
      stock: 320,
      reorderLevel: 80,
      unitPrice: 15.00,
      expiryDate: '2026-11-30',
      manufacturer: 'GlaxoSmithKline',
      status: 'In Stock',
      description: 'Broad-spectrum beta-lactam antibiotic for bacterial infections.'
    },
    {
      id: 'med_4',
      name: 'Atorvastatin Calcium',
      category: 'Cardiovascular',
      dosage: '20mg',
      form: 'Tablet',
      stock: 240,
      reorderLevel: 60,
      unitPrice: 22.00,
      expiryDate: '2027-12-01',
      manufacturer: 'Pfizer Inc.',
      status: 'In Stock',
      description: 'Lipid-lowering agent for hypercholesterolemia and stroke prevention.'
    },
    {
      id: 'med_5',
      name: 'Albuterol Sulfate Inhaler',
      category: 'Respiratory',
      dosage: '90mcg/actuation',
      form: 'Metered Inhaler',
      stock: 35,
      reorderLevel: 50,
      unitPrice: 38.00,
      expiryDate: '2027-03-20',
      manufacturer: 'Teva Respiratory',
      status: 'Low Stock',
      description: 'Short-acting beta2-adrenergic agonist for acute bronchospasm relief.'
    },
    {
      id: 'med_6',
      name: 'Epinephrine Auto-Injector',
      category: 'Emergency Medicine',
      dosage: '0.3mg',
      form: 'Auto-Injector',
      stock: 12,
      reorderLevel: 25,
      unitPrice: 145.00,
      expiryDate: '2026-12-15',
      manufacturer: 'Mylan Specialty',
      status: 'Critical Low',
      description: 'Emergency intramuscular treatment of systemic anaphylaxis.'
    },
    {
      id: 'med_7',
      name: 'Lisinopril',
      category: 'Cardiovascular',
      dosage: '10mg',
      form: 'Tablet',
      stock: 210,
      reorderLevel: 70,
      unitPrice: 9.80,
      expiryDate: '2028-02-14',
      manufacturer: 'Lupin Pharma',
      status: 'In Stock',
      description: 'ACE inhibitor for essential hypertension and congestive heart failure.'
    },
    {
      id: 'med_8',
      name: 'Paracetamol (Acetaminophen)',
      category: 'Analgesics & Fever',
      dosage: '650mg',
      form: 'Tablet',
      stock: 1200,
      reorderLevel: 200,
      unitPrice: 4.50,
      expiryDate: '2028-06-30',
      manufacturer: 'Cipla Global',
      status: 'In Stock',
      description: 'Analgesic and antipyretic for mild-to-moderate pain and pyrexia.'
    },
    {
      id: 'med_9',
      name: 'Pregabalin',
      category: 'Neurology & Pain',
      dosage: '75mg',
      form: 'Capsule',
      stock: 160,
      reorderLevel: 40,
      unitPrice: 28.50,
      expiryDate: '2027-09-10',
      manufacturer: 'Pfizer Inc.',
      status: 'In Stock',
      description: 'Indicated for neuropathic pain associated with diabetic neuropathy.'
    },
    {
      id: 'med_10',
      name: 'Insulin Glargine (Lantus)',
      category: 'Diabetes Care',
      dosage: '100 units/mL (3mL pen)',
      form: 'Injectable Pen',
      stock: 28,
      reorderLevel: 30,
      unitPrice: 65.00,
      expiryDate: '2026-11-20',
      manufacturer: 'Sanofi-Aventis',
      status: 'Low Stock',
      description: 'Recombinant human insulin analog for basal glycemic control.'
    }
  ],

  pharmacyTransactions: [
    {
      id: 'txn_101',
      type: 'DISPENSED',
      medicineId: 'med_2',
      medicineName: 'Metoprolol Tartrate',
      quantity: 30,
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      performedBy: 'Elena Gilbert, PharmD',
      referencePrescriptionId: 'rec_1',
      date: '2026-10-10T14:30:00Z',
      notes: 'Dispensed per Dr. Vance prescription record #rec_1.'
    },
    {
      id: 'txn_102',
      type: 'RESTOCKED',
      medicineId: 'med_8',
      medicineName: 'Paracetamol (Acetaminophen)',
      quantity: 500,
      performedBy: 'Elena Gilbert, PharmD',
      batchNumber: 'BATCH-2026-908',
      date: '2026-10-08T09:15:00Z',
      notes: 'Wholesale batch delivery accepted and stocked.'
    },
    {
      id: 'txn_103',
      type: 'PATIENT_PURCHASE',
      medicineId: 'med_5',
      medicineName: 'Albuterol Sulfate Inhaler',
      quantity: 1,
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      performedBy: 'Online Patient Store Checkout',
      orderId: 'ord_1001',
      date: '2026-10-12T10:20:00Z',
      notes: 'Direct online order fulfilled with home dispatch.'
    }
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
      occupiedGeneralBeds: 205, // 82%
      totalIcuBeds: 45,
      occupiedIcuBeds: 40, // 88.8%
      totalVentilators: 20,
      occupiedVentilators: 15, // 75%
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
        },
        {
          gene: 'MTHFR',
          variantId: 'rs1801133 (C677T)',
          hgvs: 'c.665C>T (p.Ala222Val)',
          zygosity: 'Heterozygous (C/T)',
          acmgClassification: 'Benign / Common Polymorphism',
          clinicalSignificance: 'Mildly Reduced Methylenetetrahydrofolate Reductase Activity',
          actionableGuideline: 'Standard dietary folate supplementation adequate; no high-dose folinic acid indicated.'
        }
      ],
      pharmacogenomics: [
        { drug: 'Clopidogrel (Plavix)', gene: 'CYP2C19', phenotype: 'Intermediate Metabolizer', alertLevel: 'Warning', cpicGuideline: 'Avoid standard clopidogrel dosing post-PCI; switch to ticagrelor 90mg BID.' },
        { drug: 'Warfarin', gene: 'VKORC1 / CYP2C9', phenotype: 'Normal Sensitivity', alertLevel: 'Safe', cpicGuideline: 'Standard INR-guided initiation and titration protocol.' },
        { drug: 'Simvastatin', gene: 'SLCO1B1', phenotype: 'Normal Function (*1/*1)', alertLevel: 'Safe', cpicGuideline: 'Standard dosing up to 40mg daily with low myopathy risk.' },
        { drug: 'Codeine / Tramadol', gene: 'CYP2D6', phenotype: 'Normal Metabolizer (*1/*1)', alertLevel: 'Safe', cpicGuideline: 'Standard analgesic dosing safe and effective.' }
      ],
      clinicalSummary: 'Overall genomic profile demonstrates marked cardiometabolic predisposition with CYP2C19 intermediate metabolizer status requiring precision tailoring of antiplatelet pharmacotherapy.'
    },
    {
      id: 'gnm_prof_02',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      sampleId: 'DNA-SEQ-2026-8842',
      sequencingDate: '2026-08-11',
      sequencingMethod: 'Illumina NovaSeq 6000 Whole Exome Sequencing (100x)',
      qualityScore: 'Q30 > 97.4% (Clinical Grade)',
      polygenicRiskScores: [
        { condition: 'Cardiovascular Atherosclerosis', percentile: 91, riskCategory: 'Very High Risk', baselinePopRisk: 22, relativeMultiplier: 3.1, recommendation: 'Intensive cardiometabolic protocol with coronary calcium score screening.' },
        { condition: 'Colorectal Carcinoma', percentile: 45, riskCategory: 'Average Population Risk', baselinePopRisk: 4.5, relativeMultiplier: 1.1, recommendation: 'Standard screening colonoscopy every 10 years.' },
        { condition: 'Type 2 Diabetes Mellitus', percentile: 94, riskCategory: 'Very High Risk', baselinePopRisk: 14, relativeMultiplier: 3.6, recommendation: 'Strict glycemic tracking, low carbohydrate nutritional protocol, HbA1c q3m.' },
        { condition: 'Late-Onset Alzheimer Disease', percentile: 68, riskCategory: 'Moderate Risk', baselinePopRisk: 10, relativeMultiplier: 1.6, recommendation: 'Cardiovascular risk factor modification is neuroprotective.' }
      ],
      detectedVariants: [
        {
          gene: 'APOE',
          variantId: 'rs429358 (e4) / rs7412 (e3)',
          hgvs: 'APOE e3/e4 genotype',
          zygosity: 'Heterozygous e3/e4',
          acmgClassification: 'Established Risk Factor',
          clinicalSignificance: '3x increased lifetime risk of late-onset neurodegenerative changes',
          actionableGuideline: 'Aggressive vascular risk factor control (BP < 120/80, LDL < 70) and annual cognitive assessment.'
        },
        {
          gene: 'SLCO1B1',
          variantId: 'rs4149056 (*5)',
          hgvs: 'c.521T>C (p.Val174Ala)',
          zygosity: 'Heterozygous (*1/*5)',
          acmgClassification: 'Pathogenic for Drug Toxicity',
          clinicalSignificance: 'Decreased Hepatic Uptake Transporter Function',
          actionableGuideline: 'Elevated risk of simvastatin-induced statin myopathy. Prescribe rosuvastatin or atorvastatin at moderate doses.'
        }
      ],
      pharmacogenomics: [
        { drug: 'Simvastatin', gene: 'SLCO1B1', phenotype: 'Decreased Transporter Function', alertLevel: 'Danger', cpicGuideline: 'Avoid high-dose simvastatin (≥40mg); substitute with atorvastatin or rosuvastatin.' },
        { drug: 'Metformin', gene: 'OCT1 (SLC22A1)', phenotype: 'Normal Glycemic Response', alertLevel: 'Safe', cpicGuideline: 'Standard first-line therapy appropriate for T2D management.' },
        { drug: 'Lisinopril', gene: 'ACE / BDKRB2', phenotype: 'Standard Response', alertLevel: 'Safe', cpicGuideline: 'Standard antihypertensive dosing with renal monitoring.' }
      ],
      clinicalSummary: 'High-risk metabolic and cardiovascular genomic architecture combined with SLCO1B1 statin transporter impairment; requires tailored lipid-lowering pharmacogenomic selection.'
    }
  ],

  genomicCatalog: [
    { gene: 'BRCA1', chromosome: '17q21.31', category: 'Hereditary Oncology', description: 'Tumor suppressor involved in DNA double-strand break repair via homologous recombination.' },
    { gene: 'BRCA2', chromosome: '13q13.1', category: 'Hereditary Oncology', description: 'Involved in maintenance of genome stability and homologous recombination repair.' },
    { gene: 'APOE', chromosome: '19q13.32', category: 'Neurogenetics & Lipids', description: 'Major apolipoprotein determining lipid transport and Alzheimer susceptibility alleles (e2, e3, e4).' },
    { gene: 'CYP2C19', chromosome: '10q23.33', category: 'Pharmacogenomics', description: 'Cytochrome P450 enzyme responsible for metabolizing antiplatelet clopidogrel, PPIs, and SSRIs.' },
    { gene: 'SLCO1B1', chromosome: '12p12.1', category: 'Pharmacogenomics', description: 'Organic anion transporter mediating hepatic uptake of statins and methotrexate.' },
    { gene: 'LDLR', chromosome: '19p13.2', category: 'Cardiometabolic', description: 'Low-density lipoprotein receptor maintaining plasma cholesterol homeostasis.' },
    { gene: 'TCF7L2', chromosome: '10q25.2-q25.3', category: 'Cardiometabolic', description: 'Transcription factor modulating proglucagon gene expression and beta-cell survival.' }
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
    },
    {
      id: 'or_suite_6',
      name: 'OR-Suite 6: Mako Orthopedic Articulated System',
      specialty: 'Robotic Total Joint Arthroplasty',
      status: 'Ready for Patient Prep',
      networkMode: 'Carrier-Grade 5G Private Medical Slice',
      latencyMs: 4.1,
      jitterMs: 0.3,
      packetLossPercent: 0.00,
      hapticRefreshRateHz: 1000,
      videoStreamFps: 60,
      videoResolution: '4K Ultra-HD Panoramic',
      activeSurgeon: 'Dr. Gregory House (Remote Mentor / Tele-Assistance)',
      inRoomSurgeon: 'Dr. Samuel Sterling (Lead Operative Surgeon)',
      anesthesiologist: 'Dr. Elena Wu, MD',
      currentProcedure: 'Robotic-Assisted Bicruciate Knee Reconstruction',
      patientName: 'Robert Vance',
      patientId: 'usr_pat_3',
      startTime: null,
      durationMinutes: 0,
      safetyInterlock: 'Engaged',
      tremorFilter: 'Active',
      workspaceBoundaries: 'Bone-Model Resection Boundary Active',
      arms: [
        { id: 'arm_1', name: 'Robotic Resection Arm', tool: 'High-Speed Precision Bone Mill', jointAngleDeg: 15.0, gripForceN: 0, status: 'Calibrated', temperatureC: 25.0 },
        { id: 'arm_2', name: 'Kinematic Tracker', tool: 'Infrared Dynamic Bone Tracker', jointAngleDeg: 8.0, gripForceN: 0, status: 'Calibrated', temperatureC: 24.8 }
      ],
      vitalTelemetry: {
        patientHeartRate: 65,
        arterialBp: '118/76',
        perfusionIndex: 4.0,
        etCO2: 37
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
    },
    {
      id: 'surg_log_102',
      suiteId: 'or_suite_4',
      timestamp: '2026-10-16T03:02:40Z',
      eventType: 'SAFETY_BOUNDARY_GUARD',
      surgeon: 'Dr. Marcus Vance',
      details: 'Haptic resistance safely applied at Left Atrial posterior boundary margin. Penetration prevented.',
      networkLatency: '3.4ms'
    },
    {
      id: 'surg_log_103',
      suiteId: 'or_suite_4',
      timestamp: '2026-10-16T03:15:22Z',
      eventType: 'VESSEL_SEALING_COMPLETED',
      surgeon: 'Dr. Marcus Vance',
      details: 'Bipolar energy cycle completed on pericardial margin (4.2 seconds). Hemostasis verified.',
      networkLatency: '3.5ms'
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
    },
    {
      id: 'qkd_node_leo_sat',
      name: 'Q-SAT-1 LEO Space-to-Ground Downlink',
      location: 'Orbital Optical Ground Terminal (LEO-550km)',
      linkType: 'Free-Space Optical Quantum Teleportation Link',
      physicalMedium: 'Free-Space Optical Laser Terminal (808nm)',
      status: 'Standby / Tracking Satellite Zenith',
      qberPercent: 2.10,
      qberThreshold: 4.50,
      keyGenRateKbps: 18.5,
      rawPhotonFlux: '0.45 Mphotons/s',
      postQuantumAlgorithm: 'NIST ML-KEM (Kyber-1024)',
      sessionKeyId: 'QKEY-SAT-ORBIT-4401',
      keyLifespanSeconds: 600,
      keyTimeRemainingSeconds: 512,
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
    },
    {
      packetId: 'QPACK-8802',
      timestamp: '2026-10-16T03:30:12Z',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      telemetrySource: 'Continuous Arterial Line & EEG Monitor',
      rawPayload: 'ArtBP: 138/88 mmHg | MAP: 104 | BIS Index: 54 | EtCO2: 36 mmHg',
      ciphertextHex: '0xb2c4e6f8a0d1f3b5c7e9a2d4f681b3d5e7f9a1c3e582a4d6f8b0d2e4f6a8c0e2',
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
    },
    {
      id: 'qlog_102',
      timestamp: '2026-10-16T02:30:00Z',
      nodeId: 'qkd_node_regional',
      eventType: 'POST_QUANTUM_HANDSHAKE',
      protocol: 'CRYSTALS-Kyber-1024 / Dilithium-5',
      details: 'Mutual post-quantum TLS handshake established between MediNova Central and Saint Jude node.'
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
    },
    {
      id: 'drn_03',
      callsign: 'AeroMed-X3 (Kestrel-Charlie)',
      model: 'MediNova Ultra-Range eVTOL Courier',
      status: 'Returning to Base (RTH)',
      batteryPercent: 62,
      cruisingSpeedKmh: 108,
      altitudeMeters: 110,
      currentLat: 40.7589,
      currentLng: -73.9851,
      distanceRemainingKm: 4.2,
      etaMinutes: 3,
      payloadBayTempC: 4.0,
      payloadBayTargetTemp: '2.0°C - 6.0°C',
      payloadType: 'Completed Mission: Returned Empty Cryo-Canister',
      flightCorridor: 'Corridor Bravo (Low-Altitude Transit)',
      destination: 'MediNova Central Blood Bank Hub',
      origin: 'Metro General Hospital',
      emergencyPriority: 'Standard Ferry Flight'
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
    },
    {
      id: 'msn_drn_502',
      droneId: 'drn_03',
      droneCallsign: 'AeroMed-X3 (Kestrel-Charlie)',
      priority: 'Urgent Surgical Resupply',
      payload: '2x Units Fresh Frozen Plasma (FFP) + 1x Cryoprecipitate',
      coldChainStatus: 'Completed (Maintained 3.9°C)',
      originHub: 'MediNova Central Blood Bank Hub',
      destinationFacility: 'Metro General Hospital',
      dispatchedAt: '2026-10-16T02:45:00Z',
      flightStatus: 'Mission Completed & Transferred',
      totalDistanceKm: 12.0,
      etaMinutes: 0,
      dispatchedBy: 'Dr. Marcus Vance'
    }
  ],

  droneAirCorridors: [
    { id: 'corr_alpha', name: 'Corridor Alpha (East River Direct Transit)', altitudeCeilingMeters: 150, maxSpeedKmh: 140, status: 'Active (Clear Skies / 8kt Wind)', airspaceAuth: 'FAA Part 135 Certified Medical BVLOS' },
    { id: 'corr_bravo', name: 'Corridor Bravo (Midtown Expressway Skyway)', altitudeCeilingMeters: 130, maxSpeedKmh: 120, status: 'Active (Clear)', airspaceAuth: 'FAA Part 135 Certified Medical BVLOS' },
    { id: 'corr_delta', name: 'Corridor Delta (Suburban Inter-Hospital Trunk)', altitudeCeilingMeters: 200, maxSpeedKmh: 160, status: 'Active (Clear)', airspaceAuth: 'FAA Part 135 Certified Medical BVLOS' }
  ],

  medicalImagingStudies: [
    {
      id: 'img_std_01',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      modality: 'Chest Radiograph (Digital X-Ray PA/Lateral)',
      studyDate: '2026-10-15',
      bodyPart: 'Chest / Thorax',
      status: 'AI Analyzed & Verified',
      aiModel: 'DenseNet-121 DeepPath Thoracic Classifier',
      confidenceScore: 96.4,
      primaryFinding: 'Right Lower Lobe Pneumonic Consolidation',
      severity: 'Moderate',
      findingsSummary: 'Focal air-space opacity identified in the right lower lung zone with air bronchograms. Cardiothoracic ratio normal (0.46). No pleural effusion or pneumothorax.',
      recommendedAction: 'Initiate empirical antibiotic regimen and repeat radiograph in 10-14 days.',
      radiologistSignOff: 'Dr. Gregory House, MD (Attending Radiologist)',
      anomalyBoundingBox: { x: 58, y: 62, width: 28, height: 24 }
    },
    {
      id: 'img_std_02',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      modality: 'Brain MRI (T1-Weighted Contrast & FLAIR 3T)',
      studyDate: '2026-10-14',
      bodyPart: 'Cranial / Cerebrum',
      status: 'AI Analyzed & Verified',
      aiModel: 'ResNet-50 NeuroScan Anomaly Detector',
      confidenceScore: 94.8,
      primaryFinding: 'Small Vessel Chronic Ischemic Leukoaraiosis',
      severity: 'Mild',
      findingsSummary: 'Scattered punctate hyperintensities in periventricular white matter on T2 FLAIR. No acute diffusion restriction (DWI) or mass effect. Ventricles age-appropriate.',
      recommendedAction: 'Control cardiovascular vascular risk factors; blood pressure optimization.',
      radiologistSignOff: 'Dr. Katherine Bell, MD (Neuro-Radiology)',
      anomalyBoundingBox: { x: 42, y: 38, width: 22, height: 18 }
    },
    {
      id: 'img_std_03',
      patientId: 'usr_pat_3',
      patientName: 'Robert Vance',
      modality: 'Knee Radiograph (Weight-Bearing AP/Lateral)',
      studyDate: '2026-10-12',
      bodyPart: 'Right Knee Joint',
      status: 'Pending Specialist Review',
      aiModel: 'OrthoVision AI Grade-4 Osteoarthritis Classifier',
      confidenceScore: 98.1,
      primaryFinding: 'Kellgren-Lawrence Grade 3 Tricompartmental Osteoarthritis',
      severity: 'Severe',
      findingsSummary: 'Marked medial compartment joint space narrowing, subchondral sclerosis, and prominent marginal osteophytes at tibial plateau.',
      recommendedAction: 'Orthopedic surgical consultation for robotic-assisted total knee arthroplasty.',
      radiologistSignOff: 'Pending Clinical Sign-off',
      anomalyBoundingBox: { x: 48, y: 52, width: 34, height: 30 }
    }
  ],

  voiceCommandsLog: [
    {
      id: 'vcmd_101',
      timestamp: '2026-10-16T03:10:00Z',
      spokenPrompt: 'Triage patient with acute chest tightness, diaphoresis, and left arm numbness',
      detectedIntent: 'EMERGENCY_TRIAGE_EVALUATION',
      extractedEntities: { symptoms: ['chest tightness', 'diaphoresis', 'left arm numbness'], urgency: 'Level 1 Immediate' },
      aiSystemResponse: 'Emergency triage evaluated: Level 1 Immediate Priority. High probability of Acute Coronary Syndrome. Alerting cardiology crash cart.',
      executedAction: 'Triage ticket #trg_stat_901 created'
    },
    {
      id: 'vcmd_102',
      timestamp: '2026-10-16T03:15:00Z',
      spokenPrompt: 'Check pharmacy inventory for Metoprolol Tartrate',
      detectedIntent: 'PHARMACY_STOCK_QUERY',
      extractedEntities: { medicine: 'Metoprolol Tartrate' },
      aiSystemResponse: 'Metoprolol Tartrate (50mg Tablet) currently has 85 units in stock. Reorder threshold is 40.',
      executedAction: 'Inventory query rendered'
    }
  ],

  multilingualTranslations: [
    {
      id: 'trans_101',
      timestamp: '2026-10-16T02:40:00Z',
      patientName: 'Maria Rodriguez',
      sourceLanguage: 'Spanish (Español)',
      targetLanguage: 'English',
      sourceText: 'Tengo un dolor muy fuerte y punzante en el pecho desde anoche que no me deja respirar bien.',
      translatedText: 'I have had a very severe, sharp pain in my chest since last night that is making it difficult to breathe properly.',
      clinicalTerminologyExtracted: ['Severe sharp chest pain (Angina Pectoris / Pleurisy)', 'Dyspnea / Shortness of breath'],
      physicianResponseEnglish: 'We are performing an electrocardiogram immediately to evaluate your heart rhythm.',
      physicianResponseTranslated: 'Estamos realizando un electrocardiograma de inmediato para evaluar su ritmo cardíaco.'
    }
  ],

  hospitalWards: [
    {
      id: 'ward_icu',
      name: 'Intensive Care Unit (Cardiac & Trauma ICU)',
      floor: 'Floor 3 - Critical Care Tower',
      totalBeds: 12,
      occupiedBeds: 10,
      turnoverSanitizingBeds: 1,
      availableBeds: 1,
      nurseToPatientRatio: '1:1 Direct Supervision',
      beds: [
        { id: 'ICU-301', status: 'Occupied', patientName: 'Sarah Jenkins', patientId: 'usr_pat_1', admissionDate: '2026-10-14', diagnosis: 'Post-Op Annuloplasty Observation', attendingNurse: 'Nurse Rachel Green, RN', telemetryStatus: 'Continuous Invasive Monitoring', vitals: { hr: 74, bp: '120/80', spo2: 99 } },
        { id: 'ICU-302', status: 'Occupied', patientName: 'John Doe', patientId: 'usr_pat_2', admissionDate: '2026-10-15', diagnosis: 'Acute Neurological Observation', attendingNurse: 'Nurse Mark Sloan, RN', telemetryStatus: 'Continuous Arterial Telemetry', vitals: { hr: 82, bp: '138/88', spo2: 96 } },
        { id: 'ICU-303', status: 'Available / Clean', patientName: null, patientId: null, admissionDate: null, diagnosis: null, attendingNurse: 'Nurse Elena Woods, RN', telemetryStatus: 'Calibrated / Ready for Intake', vitals: null },
        { id: 'ICU-304', status: 'Sanitizing / Turnover', patientName: null, patientId: null, admissionDate: null, diagnosis: 'Disinfected with UV-C robotics', attendingNurse: 'Staff In Progress', telemetryStatus: 'Sensor Re-Zeroing', vitals: null }
      ]
    },
    {
      id: 'ward_surgical',
      name: 'Surgical Step-Down & Inpatient Ward',
      floor: 'Floor 4 - Post-Surgical Wing',
      totalBeds: 24,
      occupiedBeds: 18,
      turnoverSanitizingBeds: 2,
      availableBeds: 4,
      nurseToPatientRatio: '1:4 Floor Staff',
      beds: [
        { id: 'SURG-401', status: 'Occupied', patientName: 'Robert Vance', patientId: 'usr_pat_3', admissionDate: '2026-10-15', diagnosis: 'Orthopedic Knee Resection Post-Op', attendingNurse: 'Nurse Sarah Kelly, RN', telemetryStatus: 'Pulse Oximeter & BP Cuff', vitals: { hr: 68, bp: '118/76', spo2: 98 } },
        { id: 'SURG-402', status: 'Available / Clean', patientName: null, patientId: null, admissionDate: null, diagnosis: null, attendingNurse: 'Nurse Sarah Kelly, RN', telemetryStatus: 'Ready', vitals: null }
      ]
    },
    {
      id: 'ward_emergency',
      name: 'Emergency Department Resuscitation Bays',
      floor: 'Ground Floor - Trauma Center',
      totalBeds: 8,
      occupiedBeds: 6,
      turnoverSanitizingBeds: 1,
      availableBeds: 1,
      nurseToPatientRatio: '1:2 ER Trauma Protocol',
      beds: [
        { id: 'ER-BAY-1', status: 'Occupied', patientName: 'Emergency Trauma Patient', patientId: 'usr_pat_anon', admissionDate: '2026-10-16', diagnosis: 'Level 1 Trauma Triage', attendingNurse: 'Trauma Lead Davis, RN', telemetryStatus: 'High Alert Crash Telemetry', vitals: { hr: 112, bp: '95/60', spo2: 93 } },
        { id: 'ER-BAY-2', status: 'Available / Clean', patientName: null, patientId: null, admissionDate: null, diagnosis: null, attendingNurse: 'Trauma Lead Davis, RN', telemetryStatus: 'Armed & Ready', vitals: null }
      ]
    }
  ],

  insurancePolicies: [
    {
      id: 'pol_101',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      payerName: 'BlueCross BlueShield Comprehensive Health PPO',
      policyNumber: 'BCBS-994821-X',
      groupNumber: 'GRP-MED-771',
      status: 'Active & Verified',
      annualDeductible: 1500.00,
      deductibleMet: 1250.00,
      copayOfficeVisit: 25.00,
      copayEmergency: 150.00,
      coinsurancePercent: 10,
      outOfPocketMax: 4000.00,
      coverageValidUntil: '2027-12-31'
    },
    {
      id: 'pol_102',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      payerName: 'Aetna Premier Choice Managed Care',
      policyNumber: 'AET-449102-M',
      groupNumber: 'GRP-CORP-302',
      status: 'Active & Verified',
      annualDeductible: 2000.00,
      deductibleMet: 800.00,
      copayOfficeVisit: 30.00,
      copayEmergency: 200.00,
      coinsurancePercent: 20,
      outOfPocketMax: 5000.00,
      coverageValidUntil: '2027-10-15'
    }
  ],

  insuranceClaims: [
    {
      id: 'clm_9001',
      patientId: 'usr_pat_1',
      patientName: 'Sarah Jenkins',
      payerName: 'BlueCross BlueShield',
      serviceDate: '2026-10-14',
      icd10Diagnosis: 'I34.0 (Nonrheumatic mitral valve insufficiency)',
      cptProcedure: '33426 (Valvuloplasty, mitral valve; with prosthetic ring)',
      totalBilledAmount: 18450.00,
      coveredAmount: 16800.00,
      patientCopayDue: 350.00,
      status: 'Adjudicated & Approved',
      adjudicationDate: '2026-10-15',
      authorizationCode: 'AUTH-PRE-88491-BCBS'
    },
    {
      id: 'clm_9002',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      payerName: 'Aetna Premier Choice',
      serviceDate: '2026-10-12',
      icd10Diagnosis: 'I10 (Essential hypertension) & G44.209 (Tension headache)',
      cptProcedure: '99214 (Office/Outpatient visit moderate complexity)',
      totalBilledAmount: 240.00,
      coveredAmount: 210.00,
      patientCopayDue: 30.00,
      status: 'Adjudicated & Approved',
      adjudicationDate: '2026-10-13',
      authorizationCode: 'AUTH-AET-22019'
    }
  ],

  neuralBciSessions: [
    {
      id: 'bci_ses_01',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      condition: 'Post-Stroke Hemiparesis Motor Cortex Rehabilitation',
      bciArrayType: 'High-Density 64-Channel Sensor Array (Motor Strip C3/Cz/C4)',
      samplingRateHz: 2048,
      decodingAccuracyPercent: 94.6,
      muBetaRhythmSuppression: 'Active Event-Related Desynchronization (ERD: -3.8 dB)',
      sessionDate: '2026-10-15',
      rehabScoreProgress: '+18% Upper Extremity Fugl-Meyer Assessment',
      prostheticGraspIntention: 'Calibrated (Opposable Thumb & Precision Pinch)'
    }
  ],

  nanoroboticsSwarms: [
    {
      id: 'nano_swarm_alpha',
      swarmDesignation: 'NanoBot Swarm-7 (Targeted Oncology Carrier)',
      particleType: 'Iron-Oxide Biocompatible Magnetic Nanomotors',
      diameterNanometers: 180,
      activeTargetTissue: 'Localized Micro-Vascular Glial Border (Right Temporal)',
      payloadAgent: 'Doxorubicin Pegylated Micro-Liposome',
      steeringMethod: 'External Rotating Magnetic Gradient Resonance (3.2 Tesla)',
      microVascularClearancePercent: 88.4,
      cellularUptakeRate: 'High Endocytosis Affinity',
      status: 'Active Targeted Infusion / Navigation Calibrated',
      targetPatient: 'Sarah Jenkins'
    }
  ],

  bioPrinters: [
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
  ],

  bioPrintJobs: [
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
      startedAt: '2026-10-15T22:15:00Z',
      microVascularDensity: '840 capillaries/mm²'
    },
    {
      id: 'job_bio_02',
      patientId: 'usr_pat_2',
      patientName: 'John Doe',
      organType: 'Cranial Osteochondral Regeneration Lattice',
      dimensionsMm: '45 x 45 x 4.0 mm',
      cellViabilityPercent: 98.2,
      extrusionProgressPercent: 100,
      estimatedCompletionMinutes: 0,
      scaffoldMaterial: 'Bioactive Tricalcium Phosphate & Collagen Matrix',
      intendedSurgeon: 'Dr. Elena Rostova (Neurology & Neurosurgery)',
      biocompatibilityRating: 'Autologous Osteoblast Graft Matrix (Verified)',
      status: 'Completed / Cryo-Incubated',
      startedAt: '2026-10-15T18:00:00Z',
      microVascularDensity: '620 capillaries/mm²'
    }
  ],

  spaceTelemetryNodes: [
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
    },
    {
      id: 'space_node_mars_transit',
      missionName: 'Interplanetary Deep-Space Transport (Hab-2)',
      orbitType: 'Heliocentric Transfer Trajectory',
      lightDistanceSeconds: 184.5,
      dtnProtocol: 'CCSDS Long-Haul Delay-Tolerant Relay',
      radiationDosimetryMilliSievertsPerDay: 2.15,
      lifeSupportOxygenLevelPercent: 20.9,
      cabinPressureKPa: 99.8,
      telemetrySignalQualityPercent: 96.4,
      autonomousTriageSystemStatus: 'Autonomous Edge AI Diagnostic Node Active',
      delayCompensationLatencySec: 369.0,
      stationDoctor: 'Autonomous MediNova Space Flight Surgeon AI'
    }
  ],

  spaceCrewVitals: [
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
      lastTelemetryTimestamp: '2026-10-15T22:30:00Z'
    },
    {
      id: 'crew_astronaut_02',
      callsign: 'Dr. Helen Cho, MD',
      mission: 'Orbital Hab-1 (NRHO)',
      role: 'Science Officer & Flight Surgeon',
      heartRateBpm: 72,
      bloodPressureSys: 122,
      bloodPressureDia: 80,
      spO2Percent: 98,
      radiationDoseTotalMsv: 16.8,
      boneMineralDensityDelta: '-0.6% (Within Nominal Margin)',
      cognitiveAcuityScore: 99,
      hydrationPercent: 64.1,
      microgravityCardioStatus: 'Optimal Microgravity Adaptation',
      lastTelemetryTimestamp: '2026-10-15T22:30:00Z'
    }
  ]
};


