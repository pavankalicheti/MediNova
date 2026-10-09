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
  ]
};
