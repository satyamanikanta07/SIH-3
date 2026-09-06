import { useState, useEffect } from 'react';
import { alertsAPI, districtsAPI } from '../services/api';
import { translateAlert, getCurrentLanguage, setCurrentLanguage, LANGUAGES } from '../utils/i18n';
import { FiAlertTriangle, FiPlus, FiCheck, FiSearch, FiGlobe, FiFilter, FiRefreshCw } from 'react-icons/fi';

const demoAlerts = [
  { alertId: 'ALT-0001', type: 'Road Blockage', severity: 'Critical', title: 'NH-6 Aizawl-Silchar Road Blocked', message: 'Road completely blocked due to landslide and heavy rainfall. 3 vehicles stranded. Alternate route via Tripura recommended.', location: { name: 'NH-6 near Vairengte', district: 'Aizawl' }, alternateRouteAvailable: true, isRead: false, createdAt: new Date(Date.now() - 1800000) },
  { alertId: 'ALT-0002', type: 'High Disruption Risk', severity: 'Critical', title: 'NH-39 Kohima-Imphal High Risk', message: 'ML model predicts 92% disruption probability for NH-39. Continuous heavy rainfall and historical landslide data indicate imminent road closure.', location: { name: 'NH-39 Kohima', district: 'Kohima' }, isRead: false, createdAt: new Date(Date.now() - 3600000) },
  { alertId: 'ALT-0003', type: 'Heavy Rainfall', severity: 'Warning', title: 'Heavy Rainfall Alert - Meghalaya', message: 'IMD warns of heavy to very heavy rainfall (150-200mm) expected in East Khasi Hills and Ri-Bhoi districts over next 48 hours.', location: { district: 'East Khasi Hills' }, isRead: false, createdAt: new Date(Date.now() - 7200000) },
  { alertId: 'ALT-0004', type: 'Flood Risk', severity: 'Warning', title: 'Brahmaputra Flood Warning', message: 'Water level rising at Tezpur. Flood warning issued for low-lying areas near NH-15. Vehicles advised to use alternate routes.', location: { district: 'Sonitpur' }, alternateRouteAvailable: true, isRead: false, createdAt: new Date(Date.now() - 10800000) },
  { alertId: 'ALT-0005', type: 'Vehicle Delay', severity: 'Warning', title: 'Medicine Delivery NER-105 At Risk', message: 'Critical medicine delivery to Gangtok Health Center is at risk due to landslide on NH-10. Current delay: 90 minutes.', location: { district: 'East Sikkim' }, isRead: false, createdAt: new Date(Date.now() - 14400000) },
  { alertId: 'ALT-0006', type: 'Delivery Delay', severity: 'Critical', title: 'Food Supply to Aizawl Critically Delayed', message: 'Essential food delivery DEL-0008 to Aizawl is delayed by 6 hours. Road blocked on NH-6. Aizawl has 3-day food reserves remaining.', location: { district: 'Aizawl' }, isRead: false, createdAt: new Date(Date.now() - 18000000) },
  { alertId: 'ALT-0007', type: 'Landslide Risk', severity: 'Warning', title: 'Landslide Risk on Tura-Dalu Road', message: 'Soil saturation levels critical in West Garo Hills. SH-03 may experience landslides within next 24 hours.', location: { district: 'West Garo Hills' }, isRead: false, createdAt: new Date(Date.now() - 21600000) },
  { alertId: 'ALT-0008', type: 'Accessibility Reduction', severity: 'Warning', title: 'Kohima District Accessibility Declining', message: 'Kohima district accessibility score dropped to 58%. 25 roads blocked. Essential supply chain at risk.', location: { district: 'Kohima' }, isRead: true, createdAt: new Date(Date.now() - 25200000) },
];

function timeAgo(date) {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Alerts({ user }) {
  const [alerts, setAlerts] = useState(demoAlerts);
  const [districtsList, setDistrictsList] = useState([]);
  const [activeLang, setActiveLang] = useState(getCurrentLanguage());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ severity: '', read: '', district: '' });
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [notice, setNotice] = useState('');
  const [formData, setFormData] = useState({
    title: 'NH-2 Landslide Hazard',
    severity: 'Critical',
    type: 'Road Blockage',
    district: 'Imphal West',
    message: 'NH-2 is blocked due to active landslide near Kangpokpi. Use alternate route.',
    alternateRouteAvailable: true
  });

  const isAdmin = user?.role === 'admin';

  const fetchAlerts = () => {
    alertsAPI.getAll().then(res => {
      if (res?.data?.length) setAlerts(res.data);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);

    districtsAPI.getAll().then(res => {
      if (res?.data?.length) setDistrictsList(res.data);
    }).catch(() => {});

    const handleLangChange = (e) => {
      if (e.detail?.language) setActiveLang(e.detail.language);
    };
    window.addEventListener('languageChanged', handleLangChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  const handleLanguageSwitch = (newLang) => {
    setActiveLang(newLang);
    setCurrentLanguage(newLang);
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        severity: formData.severity,
        type: formData.type,
        location: { name: formData.title, district: formData.district },
        message: formData.message,
        alternateRouteAvailable: formData.alternateRouteAvailable,
        isRead: false,
        createdAt: new Date()
      };

      const res = await alertsAPI.create(payload);
      const newAlert = res?.data || { ...payload, alertId: `ALT-${Date.now().toString().slice(-4)}` };

      setAlerts(prev => [newAlert, ...prev]);
      setNotice(`🚨 Emergency broadcast "${formData.title}" published to multi-agency network.`);
      setShowBroadcastModal(false);
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setNotice(`❌ Error broadcasting alert: ${err.message}`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  const handleMarkRead = async (alertId) => {
    try {
      await alertsAPI.markRead(alertId);
    } catch (e) {}
    setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, isRead: true } : a));
  };

  const filtered = alerts.filter(a => {
    if (filter.severity && a.severity !== filter.severity) return false;
    if (filter.read === 'unread' && a.isRead) return false;
    if (filter.read === 'read' && !a.isRead) return false;
    if (filter.district && a.location?.district !== filter.district) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title?.toLowerCase().includes(q);
      const matchMsg = a.message?.toLowerCase().includes(q);
      const matchLoc = a.location?.name?.toLowerCase().includes(q) || a.location?.district?.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchLoc) return false;
    }
    return true;
  });

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
          background: notice.startsWith('🚨') ? '#fef2f2' : '#f0fdf4',
          color: notice.startsWith('🚨') ? '#b91c1c' : '#15803d',
          border: `1px solid ${notice.startsWith('🚨') ? '#fecaca' : '#bbf7d0'}`
        }}>
          {notice}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Alerts & Emergency Notifications</h2>
          <p>Real-time multilingual hazardous weather, road blockages, and supply chain advisories</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Quick Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: 8 }}>
            <FiGlobe style={{ color: '#64748b' }} />
            <select
              value={activeLang}
              onChange={e => handleLanguageSwitch(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer', outline: 'none' }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowBroadcastModal(true)}>
              <FiAlertTriangle /> Broadcast Alert
            </button>
          )}
          <span className="badge-status critical">{alerts.filter(a => a.severity === 'Critical' && !a.isRead).length} Critical</span>
          <span className="badge-status warning">{alerts.filter(a => a.severity === 'Warning' && !a.isRead).length} Warnings</span>
        </div>
      </div>

      {/* Broadcast Alert Modal (Admin Only) */}
      {showBroadcastModal && isAdmin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 480, width: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>
              Broadcast Emergency Alert
            </h3>
            <form onSubmit={handleBroadcastAlert}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Alert Title</label>
                <input
                  className="form-control"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. NH-2 Landslide"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Severity</label>
                  <select
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <option value="Critical">🔴 Critical</option>
                    <option value="Warning">🟡 Warning</option>
                    <option value="Info">🔵 Info</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Type</label>
                  <select
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Road Blockage">Road Blockage</option>
                    <option value="High Disruption Risk">High Disruption Risk</option>
                    <option value="Heavy Rainfall">Heavy Rainfall</option>
                    <option value="Flood Risk">Flood Risk</option>
                    <option value="Bridge Alert">Bridge Alert</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Affected District</label>
                <input
                  className="form-control"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Imphal West"
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Advisory Message</label>
                <textarea
                  className="form-control"
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', resize: 'vertical' }}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe hazard details, affected corridors, and detour instructions..."
                  required
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.alternateRouteAvailable}
                    onChange={e => setFormData({ ...formData, alternateRouteAvailable: e.target.checked })}
                  />
                  Flag Alternate Route Available
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowBroadcastModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Broadcast Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter controls */}
      <div className="filters-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 36, height: 38 }}
            placeholder="Search alerts by corridor, text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select className="filter-select" style={{ height: 38 }} value={filter.district} onChange={e => setFilter({ ...filter, district: e.target.value })}>
          <option value="">All Districts</option>
          {(districtsList.length > 0 ? districtsList.map(d => d.name) : ['Imphal West', 'East Khasi Hills', 'Ri-Bhoi', 'Sonitpur', 'Kohima', 'Aizawl', 'East Sikkim']).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select className="filter-select" style={{ height: 38 }} value={filter.severity} onChange={e => setFilter({ ...filter, severity: e.target.value })}>
          <option value="">All Severity</option>
          <option value="Critical">Critical</option>
          <option value="Warning">Warning</option>
          <option value="Info">Info</option>
        </select>

        <select className="filter-select" style={{ height: 38 }} value={filter.read} onChange={e => setFilter({ ...filter, read: e.target.value })}>
          <option value="">All Notifications</option>
          <option value="unread">Unread Only</option>
          <option value="read">Acknowledged / Read</option>
        </select>
      </div>

      {/* Alert Feed */}
      <div className="card">
        {filtered.map(alert => {
          // Multilingual translation preserving technical identifiers
          const translatedTitle = translateAlert(alert.title, activeLang);
          const translatedMessage = translateAlert(alert.message, activeLang);

          return (
            <div className={`alert-item ${alert.severity?.toLowerCase()}`} key={alert.alertId} style={{ opacity: alert.isRead ? 0.75 : 1 }}>
              <span className="alert-icon">
                {alert.severity === 'Critical' ? '🚨' : alert.severity === 'Warning' ? '⚠️' : 'ℹ️'}
              </span>
              <div className="alert-content" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h4 style={{ margin: 0, fontSize: 14.5 }}>{translatedTitle}</h4>
                  <span className={`badge-status ${alert.severity?.toLowerCase()}`}>{alert.severity}</span>
                </div>
                <p style={{ margin: '4px 0 8px 0', fontSize: 13, lineHeight: 1.5 }}>{translatedMessage}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8', flexWrap: 'wrap' }}>
                  <span>📍 {alert.location?.district || alert.location?.name || 'Regional'}</span>
                  <span>🕐 {timeAgo(alert.createdAt || Date.now())}</span>
                  <span>📋 {alert.type}</span>
                  {alert.alternateRouteAvailable && <span style={{ color: '#059669', fontWeight: 600 }}>✅ Alternate route available</span>}
                </div>
              </div>
              {!alert.isRead ? (
                <button
                  className="btn btn-outline"
                  style={{ padding: '4px 10px', fontSize: 11, alignSelf: 'flex-start', marginLeft: 8 }}
                  onClick={() => handleMarkRead(alert.alertId)}
                >
                  Acknowledge / Read
                </button>
              ) : (
                <span style={{ fontSize: 11, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiCheck /> Read
                </span>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
            No alerts found matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
