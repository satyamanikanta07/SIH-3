import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Vehicles from './pages/Vehicles';
import RoutesPage from './pages/RoutesPage';
import Incidents from './pages/Incidents';
import Alerts from './pages/Alerts';
import Logistics from './pages/Logistics';
import Analytics from './pages/Analytics';
import FieldReports from './pages/FieldReports';
import Settings from './pages/Settings';
import Simulation from './pages/Simulation';
import Login from './pages/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('ner_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('ner_user'); }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('ner_user', JSON.stringify(userData));
    localStorage.setItem('ner_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ner_user');
    localStorage.removeItem('ner_token');
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div>Loading...</div>;

  if (!user) return <Login onLogin={handleLogin} />;

  const ProtectedRoute = ({ allowedRoles, children }) => {
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/map" element={<LiveMap user={user} />} />
          <Route path="/vehicles" element={<Vehicles user={user} />} />
          <Route path="/routes" element={<RoutesPage user={user} />} />
          <Route path="/incidents" element={<Incidents user={user} />} />
          <Route path="/alerts" element={<Alerts user={user} />} />
          <Route path="/logistics" element={<Logistics user={user} />} />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['admin', 'government_official']}>
              <Analytics user={user} />
            </ProtectedRoute>
          } />
          <Route path="/field-reports" element={
            <ProtectedRoute allowedRoles={['admin', 'government_official', 'field_officer']}>
              <FieldReports user={user} />
            </ProtectedRoute>
          } />
          <Route path="/simulation" element={<Simulation user={user} />} />
          <Route path="/settings" element={<Settings user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
