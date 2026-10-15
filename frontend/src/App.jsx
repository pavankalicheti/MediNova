import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import AmbulanceDashboard from './pages/AmbulanceDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TriagePage from './pages/TriagePage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import ProfilePage from './pages/ProfilePage';
import TelemedicinePage from './pages/TelemedicinePage';
import PharmacyPage from './pages/PharmacyPage';
import PredictiveAnalyticsPage from './pages/PredictiveAnalyticsPage';
import IoTVitalsPage from './pages/IoTVitalsPage';
import EmrExchangePage from './pages/EmrExchangePage';
import GenomicRiskPage from './pages/GenomicRiskPage';
import RoboticSurgeryPage from './pages/RoboticSurgeryPage';
import QuantumTelemetryPage from './pages/QuantumTelemetryPage';
import DroneDispatchPage from './pages/DroneDispatchPage';
import MedicalImagingPage from './pages/MedicalImagingPage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import MultilingualCarePage from './pages/MultilingualCarePage';
import BedManagementPage from './pages/BedManagementPage';
import InsuranceClaimsPage from './pages/InsuranceClaimsPage';
import AdvancedBiotechPage from './pages/AdvancedBiotechPage';
import BioPrintingPage from './pages/BioPrintingPage';
import SpaceTelemetryPage from './pages/SpaceTelemetryPage';


export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-blue-600">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono tracking-widest uppercase text-slate-500">Initializing MediNova System...</p>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return <Register onNavigateLogin={() => setAuthView('login')} />;
    }
    return <Login onNavigateRegister={() => setAuthView('register')} />;
  }

  // Render role-tailored dashboard view for 'dashboard' tab
  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'Patient':
        return <PatientDashboard setActiveTab={setActiveTab} />;
      case 'Doctor':
        return <DoctorDashboard setActiveTab={setActiveTab} />;
      case 'Receptionist':
        return <ReceptionistDashboard setActiveTab={setActiveTab} />;
      case 'Ambulance Driver':
        return <AmbulanceDashboard />;
      case 'Blood Bank Admin':
        return <BloodBankDashboard />;
      case 'Pharmacist':
        return <PharmacyPage />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return <PatientDashboard setActiveTab={setActiveTab} />;
    }
  };

  // Render active tab view
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardByRole();
      case 'telemedicine':
        return <TelemedicinePage />;
      case 'pharmacy':
        return <PharmacyPage />;
      case 'analytics':
        return <PredictiveAnalyticsPage />;
      case 'iot_vitals':
        return <IoTVitalsPage />;
      case 'emr_exchange':
        return <EmrExchangePage />;
      case 'genomics':
        return <GenomicRiskPage />;
      case 'robotic_surgery':
        return <RoboticSurgeryPage />;
      case 'quantum_telemetry':
        return <QuantumTelemetryPage />;
      case 'drone_dispatch':
        return <DroneDispatchPage />;
      case 'imaging_ai':
        return <MedicalImagingPage />;
      case 'voice_assistant':
        return <VoiceAssistantPage />;
      case 'multilingual':
        return <MultilingualCarePage />;
      case 'bed_management':
        return <BedManagementPage />;
      case 'insurance':
        return <InsuranceClaimsPage />;
      case 'advanced_biotech':
        return <AdvancedBiotechPage />;
      case 'bioprinting':
        return <BioPrintingPage />;
      case 'space_telemetry':
        return <SpaceTelemetryPage />;
      case 'triage':
        return <TriagePage />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'records':
        return <MedicalRecordsPage />;
      case 'ambulance':
        return <AmbulanceDashboard />;
      case 'bloodbank':
        return <BloodBankDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return <ProfilePage />;
      default:
        return renderDashboardByRole();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
