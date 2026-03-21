import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from './components/AdminDashboard';
import { DriverSignature } from './components/DriverSignature';
import { Login } from './components/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('assinagr_auth') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('assinagr_auth', 'true');
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <AdminDashboard /> : <Login onLogin={handleLogin} />} 
        />
        <Route path="/sign/:id" element={<DriverSignature />} />
      </Routes>
    </Router>
  );
}
