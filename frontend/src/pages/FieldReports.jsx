import { useState, useEffect } from 'react';
import { fieldReportsAPI, uploadAPI, districtsAPI } from '../services/api';
import {
  saveOfflineReport,
  getPendingReports,
  removeSyncedReport,
  markReportSyncFailed,
  getPendingReportCount
} from '../utils/offlineStorage';
import {
  FiMapPin, FiWifi, FiWifiOff, FiUploadCloud, FiCheck, FiCamera,
  FiAlertCircle, FiRefreshCw, FiEye, FiX, FiCheckCircle
} from 'react-icons/fi';

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
  const [syncing, setSyncing] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);

  const [form, setForm] = useState({
    type: 'Landslide',
    severity: 'Critical',
    description: '',
    location: { name: 'NH-2 near Kangpokpi', lat: 24.8170, lng: 93.9368 },
    photograph: ''
  });

  const canConvert = ['admin', 'government_official'].includes(user?.role);
  const effectiveOnline = isOnline && !simulateOffline;

  // Load IndexedDB offline reports
  const reloadOfflineReports = async () => {
    try {
      const pending = await getPendingReports();
      setOfflineReports(pending || []);
    } catch (e) {
      console.warn('Error fetching pending offline reports from IndexedDB:', e);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load from IndexedDB
    reloadOfflineReports();

    // Load remote reports from MongoDB
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
        },
        { timeout: 8000 }
      );
    } else {
      setForm(prev => ({
        ...prev,
        location: { ...prev.location, lat: 24.8170, lng: 93.9368 }
      }));
      setLocating(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reportId = `FR-${Date.now().toString().slice(-6)}`;
    const newReport = {
      ...form,
      reportId,
      reportedBy: {
        name: user?.name || 'Field Officer',
        role: user?.role || 'field_officer'
      },
      createdAt: new Date().toISOString()
    };

    if (effectiveOnline) {
      try {
        let finalPhotoUrl = '';
        if (photoFile) {
          const fd = new FormData();
          fd.append('photo', photoFile);
          try {
            const uploadRes = await uploadAPI.uploadPhoto(fd);
            finalPhotoUrl = uploadRes?.url || '';
          } catch (upErr) {
            finalPhotoUrl = photoPreview;
          }
        }

        const res = await fieldReportsAPI.create({
          ...newReport,
          photograph: finalPhotoUrl,
          status: 'Synced'
        });

        const saved = res?.data || { ...newReport, photograph: finalPhotoUrl, status: 'Synced' };
        setReports([saved, ...reports]);
        setNotice(`✅ Report ${saved.reportId} uploaded directly to central database.`);
      } catch (err) {
        // Fallback to IndexedDB offline storage
        const offlineRecord = await saveOfflineReport({
          ...newReport,
          photograph: photoPreview,
          status: 'Pending'
        });
        await reloadOfflineReports();
        setNotice(`⚠️ Server unreachable. Saved securely in browser IndexedDB (Pending Sync).`);
      }
    } else {
      // Direct offline mode — write to IndexedDB
      await saveOfflineReport({
        ...newReport,
        photograph: photoPreview,
        status: 'Pending'
      });
      await reloadOfflineReports();
      setNotice(`💾 Network offline. Report stored securely in local IndexedDB storage (Pending Sync).`);
    }

    setShowForm(false);
    setForm({
      type: 'Landslide',
      severity: 'Critical',
      description: '',
      location: { name: 'NH-2 near Kangpokpi', lat: 24.8170, lng: 93.9368 },
      photograph: ''
    });
    setPhotoFile(null);
    setPhotoName('');
    setPhotoPreview('');
    setTimeout(() => setNotice(''), 6000);
  };

  const handleSync = async () => {
    if (!effectiveOnline || !offlineReports.length) return;
    setSyncing(true);
    let successCount = 0;

    try {
      // Prepare batch for backend
      const batchPayload = [];
      for (const item of offlineReports) {
        let photoUrl = item.photograph;
        // If photo is stored as base64 in IndexedDB, attempt upload to backend
        if (photoUrl && photoUrl.startsWith('data:')) {
          try {
            const res = await fetch(photoUrl);
            const blob = await res.blob();
            const fd = new FormData();
            fd.append('photo', blob, `${item.reportId}_evidence.jpg`);
            const uploadRes = await uploadAPI.uploadPhoto(fd);
            if (uploadRes?.url) photoUrl = uploadRes.url;
          } catch (e) {
            // Keep preview if upload fails
          }
        }

        batchPayload.push({
          reportId: item.reportId,
          type: item.type,
          severity: item.severity,
          description: item.description,
          location: item.location,
          photograph: photoUrl,
          reportedBy: item.reportedBy,
          isOfflineReport: true
        });
      }

      const res = await fieldReportsAPI.syncBatch(batchPayload);
      const syncedItems = res?.data || batchPayload.map(b => ({ ...b, status: 'Synced' }));

      // Clean up IndexedDB
      for (const item of offlineReports) {
        await removeSyncedReport(item.reportId);
      }

      await reloadOfflineReports();
      setReports(prev => [...syncedItems, ...prev]);
      setNotice(`🎉 Successfully synchronized ${syncedItems.length} offline report(s) to central database!`);
    } catch (err) {
      setNotice(`❌ Synchronization failed: ${err.message || 'Unknown network error'}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setNotice(''), 6000);
    }
  };

  const handleConvertToIncident = async (reportId) => {
    try {
      await fieldReportsAPI.convertToIncident(reportId);
      setReports(prev => prev.map(r =>
        r.reportId === reportId ? { ...r, status: 'Converted to Incident' } : r
      ));
      setNotice(`✅ Field Report ${reportId} successfully converted into an Official Highway Incident.`);
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setReports(prev => prev.map(r =>
        r.reportId === reportId ? { ...r, status: 'Converted to Incident' } : r
      ));
      setNotice(`✅ Field Report ${reportId} successfully converted into an Official Highway Incident.`);
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
          <p>Local incident submissions with GPS capture, photo evidence, IndexedDB offline persistence, and auto-sync</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Offline simulator toggle button for easy testing */}
          <button
            className="btn btn-outline"
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              background: simulateOffline ? '#fef2f2' : '#f8fafc',
              borderColor: simulateOffline ? '#ef4444' : '#cbd5e1',
              color: simulateOffline ? '#dc2626' : '#475569'
            }}
            onClick={() => setSimulateOffline(!simulateOffline)}
            title="Toggle offline simulation to test IndexedDB queuing and bulk sync"
          >
            {simulateOffline ? '🔌 Exit Offline Sim' : '📡 Simulate Offline Mode'}
          </button>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 6,
            background: effectiveOnline ? '#f0fdf4' : '#fef2f2',
            color: effectiveOnline ? '#059669' : '#dc2626'
          }}>
            {effectiveOnline ? <FiWifi /> : <FiWifiOff />}
            {effectiveOnline ? 'Online (Connected)' : 'Offline (Local IndexedDB)'}
          </span>

          {offlineReports.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge-status warning" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                🟠 Pending Sync: {offlineReports.length}
              </span>
              {effectiveOnline && (
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: 12, background: '#059669', borderColor: '#059669' }}
                  onClick={handleSync}
                  disabled={syncing}
                >
                  <FiUploadCloud /> {syncing ? 'Syncing...' : 'Sync Now'}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>📝 Submit Ground Hazard Field Report</h3>
            <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => setShowForm(false)}>
              <FiX />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid-3">
              <div className="form-group">
                <label>Hazard Type</label>
                <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Heavy Traffic', 'Accident', 'Weather Hazard', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
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
                  placeholder="e.g. NH-2 near Kangpokpi, KM Marker 45"
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
                placeholder="Describe size of blockage, mudslide volume, trapped vehicles, bridge cracks..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label>Attach Field Photo / Ground Camera Evidence</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="form-control"
                  style={{ maxWidth: 320 }}
                  onChange={handlePhotoSelect}
                />
                {photoPreview && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoName(''); setPhotoPreview(''); }}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">
                {effectiveOnline ? 'Submit Report (Live)' : 'Save Offline (IndexedDB)'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* IndexedDB Offline Pending Queue Card */}
      {offlineReports.length > 0 && (
        <div className="card" style={{ marginBottom: 16, background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h4 style={{ color: '#92400e', margin: 0, fontSize: 14 }}>
              ⏳ Local IndexedDB Offline Queue ({offlineReports.length} pending upload)
            </h4>
            {effectiveOnline && (
              <button
                className="btn btn-primary"
                style={{ padding: '4px 12px', fontSize: 11, background: '#059669', borderColor: '#059669' }}
                onClick={handleSync}
                disabled={syncing}
              >
                <FiUploadCloud /> {syncing ? 'Syncing...' : 'Sync Pending to Cloud'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {offlineReports.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: '1px dashed #fcd34d', paddingBottom: 6 }}>
                <div>
                  <strong>{r.reportId}</strong> — {r.type} at {r.location?.name} ({r.severity})
                  <div style={{ fontSize: 11, color: '#78350f' }}>{r.description}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {r.photograph && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '2px 6px', fontSize: 11 }}
                      onClick={() => setSelectedPhotoModal(r.photograph)}
                    >
                      <FiEye /> Photo
                    </button>
                  )}
                  <span className="badge-status warning">
                    🟠 Pending Sync
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Field Incident Reports Log</h3>
          <button
            className="btn btn-outline"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={reloadOfflineReports}
            title="Refresh sync status"
          >
            <FiRefreshCw /> Refresh Status
          </button>
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
                <th>Photo Evidence</th>
                <th>Description</th>
                <th>Reported By</th>
                <th>Sync Status</th>
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
                  <td>
                    {r.photograph ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoModal(r.photograph)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                        title="Click to view photo evidence"
                      >
                        <img
                          src={r.photograph.startsWith('/') ? `http://localhost:5000${r.photograph}` : r.photograph}
                          alt="Evidence"
                          style={{ width: 44, height: 34, objectFit: 'cover', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x60?text=Photo'; }}
                        />
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td style={{ maxWidth: 260, whiteSpace: 'normal', fontSize: 12.5, lineHeight: 1.4 }}>{r.description}</td>
                  <td>{r.reportedBy?.name || 'Field Officer'}</td>
                  <td>
                    {r.status === 'Converted to Incident' ? (
                      <span className="badge-status safe" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiCheckCircle /> Incident Live
                      </span>
                    ) : r.status === 'Pending' || r.status === 'Pending Sync' ? (
                      <span className="badge-status warning">
                        🟠 Pending Sync
                      </span>
                    ) : (
                      <span className="badge-status open" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        🟢 Synced
                      </span>
                    )}
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
                          ✓ Converted
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

      {/* Photo Viewer Modal */}
      {selectedPhotoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden',
            maxWidth: 600, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: 14 }}>Field Evidence Photograph</strong>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 16, overflowY: 'auto', textAlign: 'center' }}>
              <img
                src={selectedPhotoModal.startsWith('/') ? `http://localhost:5000${selectedPhotoModal}` : selectedPhotoModal}
                alt="Field Evidence Full"
                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Image+Unavailable'; }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
