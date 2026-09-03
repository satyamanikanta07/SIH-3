import { useState } from 'react';
import { authAPI } from '../services/api';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'field_officer', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isRegister
        ? await authAPI.register(form)
        : await authAPI.login({ email: form.email, password: form.password });
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      // Fallback: allow demo login without backend
      if (form.email === 'admin@nerlogistics.gov.in' && form.password === 'admin123') {
        onLogin({ name: 'Admin User', email: form.email, role: 'admin' }, 'demo-token');
      } else if (form.email === 'official@nerlogistics.gov.in' && form.password === 'official123') {
        onLogin({ name: 'Dr. Rajendra Singh', email: form.email, role: 'government_official' }, 'demo-token');
      } else if (form.email === 'field@nerlogistics.gov.in' && form.password === 'field123') {
        onLogin({ name: 'Officer Marbaniang', email: form.email, role: 'field_officer' }, 'demo-token');
      } else if (form.email === 'driver@nerlogistics.gov.in' && form.password === 'driver123') {
        onLogin({ name: 'Rajesh Kumar', email: form.email, role: 'driver' }, 'demo-token');
      } else {
        setError(err.message || 'Login failed. Try demo credentials shown below.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">🚛</div>
          <h2>NER Smart Logistics</h2>
          <p>Intelligence Platform for North Eastern Region</p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="government_official">Government Official</option>
                  <option value="field_officer">Field Officer</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@nerlogistics.gov.in" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }} disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 13, cursor: 'pointer' }}
            onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have an account? Sign in' : 'Create new account'}
          </button>
        </div>

        <div style={{ marginTop: 24, padding: 16, background: '#f0f2f5', borderRadius: 8, fontSize: 12, color: '#475569' }}>
          <strong>Demo Credentials:</strong>
          <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
            <span>👨‍💼 Admin: admin@nerlogistics.gov.in / admin123</span>
            <span>🏛️ Official: official@nerlogistics.gov.in / official123</span>
            <span>👷 Field: field@nerlogistics.gov.in / field123</span>
            <span>🚗 Driver: driver@nerlogistics.gov.in / driver123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
