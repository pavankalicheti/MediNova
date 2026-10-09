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

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-teal-400">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono tracking-widest uppercase">Initializing MediNova System...</p>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
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
