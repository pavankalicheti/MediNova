import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export const DEMO_USERS = [
  { role: 'Patient', email: 'patient@medinova.com', password: 'password123', name: 'Sarah Jenkins', label: 'Patient (Sarah Jenkins)' },
  { role: 'Doctor', email: 'doctor@medinova.com', password: 'password123', name: 'Dr. Marcus Vance', label: 'Doctor (Dr. Vance - Cardiology)' },
  { role: 'Receptionist', email: 'receptionist@medinova.com', password: 'password123', name: 'David Miller', label: 'Receptionist (David)' },
  { role: 'Ambulance Driver', email: 'driver@medinova.com', password: 'password123', name: 'Robert Taylor', label: 'Ambulance Driver (Robert)' },
  { role: 'Blood Bank Admin', email: 'bloodbank@medinova.com', password: 'password123', name: 'Dr. Aris Thorne', label: 'Blood Bank Admin (Dr. Thorne)' },
  { role: 'Admin', email: 'admin@medinova.com', password: 'password123', name: 'Clara Oswald', label: 'System Admin (Clara)' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('medinova_token');
    if (token) {
      api.getMe()
        .then(res => {
          setUser(res.user);
        })
        .catch(() => {
          localStorage.removeItem('medinova_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('medinova_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('medinova_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const quickLoginAs = async (roleName) => {
    const demoUser = DEMO_USERS.find(u => u.role === roleName);
    if (demoUser) {
      return await login(demoUser.email, demoUser.password);
    }
  };

  const logout = () => {
    localStorage.removeItem('medinova_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, quickLoginAs, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
