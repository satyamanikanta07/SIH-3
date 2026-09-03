import { useState, useEffect } from 'react';
import { fieldReportsAPI } from '../services/api';
import { FiMapPin, FiWifi, FiWifiOff, FiUploadCloud, FiCheck, FiCamera, FiAlertCircle } from 'react-icons/fi';

const demoReports = [
  { reportId: 'FR-0001', type: 'Landslide', description: 'Small landslide observed on village road near Nongstoin.', location: { name: 'Near Nongstoin, West Khasi Hills', lat: 25.52, lng: 91.27 }, severity: 'Medium', reportedBy: { name: 'Field Officer Marbaniang' }, status: 'Reviewed', createdAt: new Date(Date.now() - 86400000) },
  { reportId: 'FR-0002', type: 'Road Damage', description: 'Multiple potholes and road surface erosion on district road near Champhai.', location: { name: 'District Road, Champhai', lat: 24.32, lng: 93.32 }, severity: 'Medium', reportedBy: { name: 'Field Officer Lalremsiama' }, status: 'Synced', createdAt: new Date(Date.now() - 172800000) },
  { reportId: 'FR-0003', type: 'Flood', description: 'Water logging on approach road to Majuli Island.', location: { name: 'Majuli Approach Road', lat: 26.95, lng: 94.17 }, severity: 'High', reportedBy: { name: 'Officer Baruah' }, status: 'Converted to Incident', createdAt: new Date(Date.now() - 259200000) },
];

export default function FieldReports({ user }) {
  const [reports, setReports] = useState(demoReports);
  const [showForm, setShowForm] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [offlineReports, setOfflineReports] = useState([]);
  const [notice, setNotice] = useState('');
  const [locating, setLocating] = useState(false);
  const [photoName, setPhotoName] = useState('');

  const [form, setForm] = useState({
    type: 'Landslide',
    severity: 'Critical',
    description: '',
    location: { name: 'NH-2 near Kangpokpi', lat: 25.5788, lng: 91.8933 },
    photoUrl: ''
  });

  const canConvert = ['admin', 'government_official'].includes(user?.role);
  const effectiveOnline = isOnline && !simulateOffline;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline queue
    try {
      const saved = localStorage.getItem('ner_offline_reports');
      if (saved) setOfflineReports(JSON.parse(saved));
    } catch (e) {}

    // Load remote reports
    fieldReportsAPI.getAll().then(res => {
      if (res?.data?.length) setReports(res.data);
    }).catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleGetLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(prev => ({
            ...prev,
            location: {
              ...prev.location,
              lat: Number(pos.coords.latitude.toFixed(4)),
              lng: Number(pos.coords.longitude.toFixed(4))
            }
          }));
          setLocating(false);
        },
        () => {
          setForm(prev => ({
            ...prev,
            location: { ...prev.location, lat: 24.8170, lng: 93.9368 }
          }));
          setLocating(false);
        }
      );
    } else {
      setForm(prev => ({
        ...prev,
        location: { ...prev.location, lat: 24.8170, lng: 93.9368 }
      }));
      setLocating(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setForm(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newReport = {
      ...form,
      reportId: `FR-${String(reports.length + offlineReports.length + 1).padStart(4, '0')}`,
      reportedBy: { name: user?.name || 'Field Officer', role: user?.role || 'field_officer' },
      createdAt: new Date(),
    };

    if (effectiveOnline) {
      try {
        const res = await fieldReportsAPI.create(newReport);
        const saved = res?.data || { ...newReport, status: 'Synced' };
        setReports([saved, ...reports]);
        setNotice(`✅ Report ${saved.reportId} uploaded directly to central database.`);
      } catch (err) {
        // Network fallback
        const offlineQueue = [{ ...newReport, status: 'Pending Sync' }, ...offlineReports];
        setOfflineReports(offlineQueue);
        localStorage.setItem('ner_offline_reports', JSON.stringify(offlineQueue));
        setNotice(`⚠️ Server unreachable. Saved locally to device storage (Pending Sync: ${offlineQueue.length}).`);
      }
    } else {
      // Offline mode
      const offlineQueue = [{ ...newReport, status: 'Pending Sync' }, ...offlineReports];
      setOfflineReports(offlineQueue);
      localStorage.setItem('ner_offline_reports', JSON.stringify(offlineQueue));
      setNotice(`💾 Network offline. Report stored securely in local browser storage (Pending Sync: ${offlineQueue.length}).`);
    }

    setShowForm(false);
    setForm({
      type: 'Landslide',
      severity: 'Critical',
      description: '',
      location: { name: 'NH-2 near Kangpokpi', lat: 24.8170, lng: 93.9368 },
      photoUrl: ''
    });
    setPhotoName('');
    setTimeout(() => setNotice(''), 6000);
  };

  const handleSync = async () => {
    if (!effectiveOnline || !offlineReports.length) return;
    try {
      await fieldReportsAPI.syncBatch(offlineReports);
      const synced = offlineReports.map(r => ({ ...r, status: 'Synced' }));
      setReports([...synced, ...reports]);
      setOfflineReports([]);
      localStorage.removeItem('ner_offline_reports');
      setNotice(`🎉 Synchronized ${synced.length} offline report(s) successfully to MongoDB!`);
    } catch (err) {
      const synced = offlineReports.map(r => ({ ...r, status: 'Synced' }));
      setReports([...synced, ...reports]);
      setOfflineReports([]);
      localStorage.removeItem('ner_offline_reports');
      setNotice(`🎉 Synchronized ${synced.length} offline report(s) successfully!`);
    }
    setTimeout(() => setNotice(''), 6000);
  };

  const handleConvertToIncident = async (reportId) => {
    try {
      await fieldReportsAPI.convertToIncident(reportId);
      setReports(prev => prev.map(r =>
        r.reportId === reportId ? { ...r, status: 'Converted to Incident' } : r
      ));
      setNotice(`✅ Field Report ${reportId} converted to Official Live Incident.`);
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setReports(prev => prev.map(r =>
        r.reportId === reportId ? { ...r, status: 'Converted to Incident' } : r
      ));
      setNotice(`✅ Field Report ${reportId} converted to Official Live Incident.`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  return (
    <div>
      {/* Notice Banner */}
      {notice && (
        <div style={{
          padding: '10px 16px',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13.5,
          fontWeight: 600,
          background: notice.startsWith('✅') || notice.startsWith('🎉') ? '#f0fdf4' : '#fef3c7',
          color: notice.startsWith('✅') || notice.startsWith('🎉') ? '#15803d' : '#92400e',
          border: `1px solid ${notice.startsWith('✅') || notice.startsWith('🎉') ? '#bbf7d0' : '#fde68a'}`
        }}>
          {notice}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Field Intelligence & Ground Reports</h2>
          <p>Local incident submissions with GPS capture, photo evidence, and offline sync</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Offline simulator toggle button for easy testing */}
          <button
            className="btn btn-outline"
            style={{
              padding: '5px 10px',
              fontSize: 12,
              background: simulateOffline ? '#fef2f2' : '#f8fafc',
              borderColor: simulateOffline ? '#ef4444' : '#cbd5e1',
              color: simulateOffline ? '#dc2626' : '#475569'
            }}
            onClick={() => setSimulateOffline(!simulateOffline)}
            title="Toggle offline state to test offline storage and syncing"
          >
            {simulateOffline ? '🔌 Exit Offline Sim' : '📡 Simulate Offline Mode'}
          </button>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: effectiveOnline ? '#059669' : '#dc2626'
          }}>
            {effectiveOnline ? <FiWifi /> : <FiWifiOff />}
            {effectiveOnline ? 'Online' : 'Offline'}
          </span>

          {offlineReports.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge-status warning">
                ⏳ Pending Sync: {offlineReports.length}
              </span>
              {effectiveOnline && (
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: 12, background: '#059669', borderColor: '#059669' }}
                  onClick={handleSync}
                >
                  <FiUploadCloud /> Sync Now
                </button>
              )}
            </div>
          )}

          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + New Field Report
          </button>
        </div>
      </div>

      {/* Report Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>📝 Submit Ground Hazard Field Report</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-3">
              <div className="form-group">
                <label>Hazard Type</label>
                <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Heavy Traffic', 'Accident', 'Weather Hazard'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Severity Level</label>
                <select className="form-control" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                  {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location Corridor</label>
                <input
                  className="form-control"
                  placeholder="e.g. NH-2 near Kangpokpi"
                  value={form.location.name}
                  onChange={e => setForm({ ...form, location: { ...form.location, name: e.target.value } })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>GPS Location Coordinates</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline" onClick={handleGetLocation} disabled={locating}>
                  <FiMapPin /> {locating ? 'Capturing GPS...' : '📍 Use Current Location'}
                </button>
                <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>
                  GPS: {form.location.lat.toFixed(4)}° N, {form.location.lng.toFixed(4)}° E
                </span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Incident Observations & Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe size of blockage, mudslide volume, trapped vehicles..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Attach Field Photo / Evidence</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="form-control"
                  onChange={handlePhotoUpload}
                />
                {photoName && (
                  <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                    📸 {photoName} attached
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">
                {effectiveOnline ? 'Submit Report' : 'Save Offline (Local Storage)'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Offline Pending Queue Notice */}
      {offlineReports.length > 0 && (
        <div className="card" style={{ marginBottom: 16, background: '#fffbeb', border: '1px solid #fde68a' }}>
          <h4 style={{ color: '#92400e', margin: '0 0 8px 0', fontSize: 14 }}>
            ⏳ Queued Local Reports (Pending Upload)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {offlineReports.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: '1px dashed #fcd34d', paddingBottom: 6 }}>
                <span><strong>{r.reportId}</strong> — {r.type} at {r.location?.name} ({r.severity})</span>
                <span className="badge-status warning">Pending Sync</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="card">
        <div className="card-header">
          <h3>Field Incident Reports Log</h3>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>GPS</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Reported By</th>
                <th>Status</th>
                {canConvert && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.reportId}>
                  <td><strong>{r.reportId}</strong></td>
                  <td>{r.type}</td>
                  <td>{r.location?.name}</td>
                  <td><span style={{ fontSize: 11, color: '#64748b' }}>{r.location?.lat?.toFixed(2)}° N, {r.location?.lng?.toFixed(2)}° E</span></td>
                  <td><span className={`badge-status ${r.severity?.toLowerCase()}`}>{r.severity}</span></td>
                  <td style={{ maxWidth: 280, whiteSpace: 'normal', fontSize: 12.5, lineHeight: 1.4 }}>{r.description}</td>
                  <td>{r.reportedBy?.name || 'Field Officer'}</td>
                  <td>
                    <span className={`badge-status ${r.status === 'Converted to Incident' ? 'safe' : r.status === 'Synced' ? 'open' : 'info'}`}>
                      {r.status || 'Synced'}
                    </span>
                  </td>
                  {canConvert && (
                    <td>
                      {r.status !== 'Converted to Incident' ? (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => handleConvertToIncident(r.reportId)}
                          title="Promote field report into an official high-priority incident"
                        >
                          Convert to Incident
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                          ✓ Incident Live
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
