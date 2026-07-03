import React, { useState, useEffect } from 'react';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AttendanceForm from './pages/AttendanceForm';

function App() {
  const path = window.location.pathname;
  const [token, setToken] = useState(localStorage.getItem('esevai_token'));

  useEffect(() => {
    const handler = () => setToken(localStorage.getItem('esevai_token'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleLogin = (t) => {
    localStorage.setItem('esevai_token', t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('esevai_token');
    setToken(null);
    window.location.href = '/admin';
  };

  // Route: /admin → login or dashboard
  if (path.startsWith('/admin')) {
    if (token) return <AdminDashboard onLogout={handleLogout} />;
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Route: /attendance or / → participant form
  return <AttendanceForm />;
}

export default App;
