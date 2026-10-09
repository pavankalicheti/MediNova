# 🏥 MediNova — AI-Powered Healthcare Management System

MediNova is an AI-assisted healthcare management platform built for live student software engineering demonstrations to professors and clinical evaluators. It features multi-role access control, AI-assisted emergency triage scoring, digital medical records, appointment scheduling, ambulance dispatch with simulated live Leaflet GPS tracking, and a blood donor compatibility engine.

---

## 🔑 Demo Quick-Login Credentials

| Role | Email Address | Password | Active Demo Features |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@medinova.com` | `password123` | Personal profile, book appointments, medical timeline, triage form |
| **Doctor** | `doctor@medinova.com` | `password123` | Live ER triage priority queue, schedule manager, issue diagnoses |
| **Receptionist** | `receptionist@medinova.com` | `password123` | Master appointments roster, walk-in intake, emergency dispatch |
| **Ambulance Driver**| `driver@medinova.com` | `password123` | Trip dispatch manager, update trip status (`En route`/`Arrived`/`Completed`) |
| **Blood Bank Admin**| `bloodbank@medinova.com` | `password123` | Stock level editor, low-unit alert monitoring, donor registry |
| **System Admin** | `admin@medinova.com` | `password123` | System stats overview, user management table (add/remove staff) |

> 💡 **Single-Click Demo Role Switcher**: On the Login screen (or top navigation bar), click **"Switch Role"** to instantly switch between any of the 6 roles without re-typing credentials!

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + Leaflet Maps (`leaflet` & `react-leaflet`)
- **Backend**: Node.js + Express REST API
- **Database**: Zero-dependency file-backed JSON database store pre-seeded with sample doctors, patients, triage cases, blood inventory, and ambulances for instant out-of-the-box demo execution
- **Security & Auth**: JSON Web Tokens (JWT) + Role-Based Access Control (RBAC) middleware

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Run the Backend API Server
```bash
cd backend
npm install
npm start
```
*The Express server will start on `http://localhost:5000` with pre-loaded seed data.*

### 2. Run the Frontend Client App
```bash
cd frontend
npm install
npm run dev
```
*Open your browser at `http://localhost:3000` (or `http://localhost:5173`).*

---

## 📋 Implemented Modules

### Phase A: Core
1. **Authentication & Role-Based Access**: Sign up / login for all 6 roles with dedicated role dashboards and protected API middleware.
2. **Patient Registration & Profile**: Digital Patient Passport managing vitals declaration, blood group, and emergency contacts.
3. **Digital Medical Records**: Timeline of diagnoses, prescribed medications, symptoms, and physician notes.
4. **Appointment Scheduling**: Choice of doctor specialty, slot selection, and master calendar controls.
5. **System Admin Dashboard**: Executive metrics dashboard with live stats and staff user CRUD.

### Phase B: Emergency & Response
6. **AI-Assisted Emergency Triage**: Form accepting patient symptoms and vitals (`Heart Rate`, `BP`, `SpO2`, `Temp`). Backend rule engine (`src/utils/triageEngine.js`) assigns weighted Priority scores (**Critical**, **Urgent**, **Moderate**, **Low**) and outputs an ER priority queue for doctors.
7. **Ambulance Request & Live Map Tracking**: Pickup request dispatching nearest driver. Includes interactive **Leaflet + OpenStreetMap** view with simulated live position marker movement.
8. **Blood Donor Matching & Inventory**: Real-time stock level grid with low-stock warnings (<5 units threshold) and recipient blood compatibility matching algorithm (including O- universal donor rules).

### 🔮 Future Modules Roadmap (Placeholder Items)
- **Telemedicine (Video consultations)**
- **Pharmacy & Medicine Inventory Store**
- **Predictive Healthcare Analytics Dashboard**

---

## 🤖 AI Triage Scoring Architecture (`triageEngine.js`)

The AI triage scoring engine is purposefully **isolated** in `backend/src/utils/triageEngine.js` so it can be swapped for a trained machine learning model in future iterations. It calculates weighted points across:
- **Oxygen Saturation (SpO2)**: `< 90%` (+45 pts critical hypoxia)
- **Heart Rate**: `> 140` or `< 40 bpm` (+35 pts)
- **Blood Pressure**: `Systolic ≥ 180 / ≤ 80` (+30 pts)
- **High-Risk Symptoms**: Keywords such as "chest pain", "unconscious", "stroke", "severe bleeding" (+40 pts per hit)

Priority outputs:
- **Critical (Score ≥ 65)**: Pulsing alert UI, top priority in doctor ER queue
- **Urgent (Score 45-64)**: Assessment within 15-30 mins
- **Moderate (Score 25-44)**: Evaluation within 60 mins
- **Low (Score < 25)**: Outpatient clinic routing
