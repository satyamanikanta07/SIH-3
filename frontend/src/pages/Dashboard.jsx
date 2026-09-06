import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiCheckCircle, FiAlertTriangle, FiXCircle, FiTruck, FiClock, FiBell, FiAlertOctagon, FiActivity, FiArrowRight, FiNavigation, FiShield } from 'react-icons/fi';
import { analyticsAPI, alertsAPI, deliveriesAPI, districtsAPI, roadsAPI } from '../services/api';
import DashboardMap from '../components/DashboardMap';
import { getTranslation } from '../utils/i18n';

// Fallback demo stats
const initialStats = {
  roads: { total: 14, open: 8, risky: 3, blocked: 3 },
  vehicles: { total: 10, moving: 6, delayed: 3 },
  incidents: { total: 8, active: 6 },
  deliveries: { total: 12, delayed: 4, inTransit: 7 },
  criticalAlerts: 3
};

const initialDistricts = [
  { name: 'Kamrup Metro', state: 'Assam', accessibilityScore: 92, openRoads: 3, riskyRoads: 0, blockedRoads: 0, riskLevel: 'Low' },
  { name: 'East Khasi Hills', state: 'Meghalaya', accessibilityScore: 72, openRoads: 2, riskyRoads: 1, blockedRoads: 0, riskLevel: 'Medium' },
  { name: 'Imphal West', state: 'Manipur', accessibilityScore: 68, openRoads: 1, riskyRoads: 1, blockedRoads: 1, riskLevel: 'High' },
  { name: 'Aizawl', state: 'Mizoram', accessibilityScore: 50, openRoads: 0, riskyRoads: 0, blockedRoads: 1, riskLevel: 'Critical' },
  { name: 'Kohima', state: 'Nagaland', accessibilityScore: 50, openRoads: 0, riskyRoads: 1, blockedRoads: 1, riskLevel: 'Critical' },
  { name: 'East Sikkim', state: 'Sikkim', accessibilityScore: 65, openRoads: 1, riskyRoads: 1, blockedRoads: 0, riskLevel: 'Medium' },
];

function timeAgo(date) {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(initialStats);
  const [alerts, setAlerts] = useState([]);
  const [criticalDeliveries, setCriticalDeliveries] = useState([]);
  const [districts, setDistricts] = useState(initialDistricts);
  const [insights, setInsights] = useState([]);
  const [blockedRoads, setBlockedRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('ner_lang') || 'en');

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, alertsRes, deliveriesRes, insightsRes, districtsRes, roadsRes] = await Promise.allSettled([
        analyticsAPI.getOverview(),
        alertsAPI.getAll({ severity: 'Critical' }),
        deliveriesAPI.getAll({ priority: 'Critical' }),
        analyticsAPI.getInsights(),
        districtsAPI.getAll(),
        roadsAPI.getAll({ status: 'Blocked' })
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
        setStats(overviewRes.value.data);
      }
      if (alertsRes.status === 'fulfilled' && alertsRes.value?.data) {
        setAlerts(alertsRes.value.data.slice(0, 5));
      }
      if (deliveriesRes.status === 'fulfilled' && deliveriesRes.value?.data) {
        setCriticalDeliveries(deliveriesRes.value.data.slice(0, 6));
      }
      if (insightsRes.status === 'fulfilled' && insightsRes.value?.data) {
        setInsights(insightsRes.value.data);
      }
      if (districtsRes.status === 'fulfilled' && districtsRes.value?.data?.length) {
        setDistricts(districtsRes.value.data.slice(0, 6));
      }
      if (roadsRes.status === 'fulfilled' && roadsRes.value?.data) {
        setBlockedRoads(roadsRes.value.data);
      }
    } catch (e) {
      console.warn('Dashboard live fetch fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // 10s live sync

    const onLang = (e) => setCurrentLang(e.detail);
    window.addEventListener('ner_language_changed', onLang);
    return () => {
      clearInterval(interval);
      window.removeEventListener('ner_language_changed', onLang);
    };
  }, []);

  const statCards = [
    { label: getTranslation('roadsMonitored', currentLang), value: stats.roads.total, icon: FiMapPin, color: 'blue' },
    { label: getTranslation('openRoads', currentLang), value: stats.roads.open, icon: FiCheckCircle, color: 'green' },
    { label: getTranslation('riskyRoads', currentLang), value: stats.roads.risky, icon: FiAlertTriangle, color: 'yellow' },
    { label: getTranslation('blockedRoads', currentLang), value: stats.roads.blocked, icon: FiXCircle, color: 'red' },
    { label: getTranslation('activeVehicles', currentLang), value: stats.vehicles.total, icon: FiTruck, color: 'blue' },
    { label: getTranslation('delayedDeliveries', currentLang), value: stats.deliveries.delayed, icon: FiClock, color: 'yellow' },
    { label: getTranslation('criticalAlerts', currentLang), value: stats.criticalAlerts, icon: FiBell, color: 'red' },
    { label: getTranslation('activeIncidents', currentLang), value: stats.incidents.active, icon: FiAlertOctagon, color: 'red' },
  ];

  return (
    <div>
      {/* 8 Situation Stat Cards */}
      <div className="stat-cards">
        {statCards.map(card => (
          <div className="stat-card" key={card.label}>
            <div className={`stat-icon ${card.color}`}>
              <card.icon />
            </div>
            <div className="stat-info">
              <h4>{card.label}</h4>
              <div className="stat-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map + Dynamic AI Logistics Intelligence */}
      <div className="grid-2-1" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>🗺️ Live Geographical Infrastructure Map</h3>
            <Link to="/map" className="card-action">Full GIS Map →</Link>
          </div>
          <DashboardMap />
        </div>

        <div className="card">
          <div className="card-header">
            <h3>🤖 {getTranslation('aiInsights', currentLang)}</h3>
            <span className="badge-status info" style={{ fontSize: 11 }}>Active Multi-Factor Inference</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.length === 0 ? (
              <div style={{ padding: 16, color: '#64748b', fontSize: 13, textAlign: 'center' }}>
                Loading live AI intelligence...
              </div>
            ) : (
              insights.map((insight, i) => (
                <div className="insight-card" key={i} style={{ borderLeft: '4px solid var(--primary)' }}>
                  <span className="insight-icon" style={{ fontSize: 20 }}>{insight.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 2 }}>
                      {insight.type}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#1e293b', lineHeight: 1.4 }}>
                      {insight.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* District Connectivity Matrix + Logistics Bottlenecks (Requirement 10) */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* District-wise Connectivity Table */}
        <div className="card">
          <div className="card-header">
            <h3>🏘️ {getTranslation('districtConnectivity', currentLang)}</h3>
            <Link to="/settings" className="card-action">All Districts →</Link>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>Accessibility</th>
                  <th>Open</th>
                  <th>Risky</th>
                  <th>Blocked</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {districts.map(d => (
                  <tr key={d.name}>
                    <td><strong>{d.name}</strong> <span style={{ fontSize: 11, color: '#94a3b8' }}>({d.state})</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 45, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            width: `${d.accessibilityScore || 70}%`,
                            height: '100%',
                            background: (d.accessibilityScore || 70) >= 75 ? '#059669' : (d.accessibilityScore || 70) >= 60 ? '#d97706' : '#dc2626'
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{d.accessibilityScore || 70}%</span>
                      </div>
                    </td>
                    <td><span style={{ color: '#059669', fontWeight: 600 }}>{d.openRoads ?? 0}</span></td>
                    <td><span style={{ color: '#d97706', fontWeight: 600 }}>{d.riskyRoads ?? 0}</span></td>
                    <td><span style={{ color: '#dc2626', fontWeight: 600 }}>{d.blockedRoads ?? 0}</span></td>
                    <td>
                      <span className={`badge-status ${(d.riskLevel || 'Medium').toLowerCase()}`}>
                        {d.riskLevel || 'Medium'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Emergency Routes & Active Bypass Recommendations (Requirement 10 & C) */}
        <div className="card">
          <div className="card-header">
            <h3>🚨 {getTranslation('emergencyRoutes', currentLang)}</h3>
            <Link to="/routes" className="card-action">Route Engine →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: 14
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: '#991b1b', fontSize: 13.5 }}>
                  🔴 NH-2 Imphal-Dimapur Highway (BLOCKED)
                </span>
                <span className="badge-status critical" style={{ fontSize: 10 }}>Landslide Hazard</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#7f1d1d', marginBottom: 8 }}>
                <strong>Recommended Alternative:</strong> NH-44 Bypass via Nongpoh Valley Connector
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#475569', background: '#fff', padding: '6px 10px', borderRadius: 6 }}>
                <span><strong>Extra Distance:</strong> +27 km</span>
                <span><strong>Additional Time:</strong> +42 minutes</span>
                <span><strong>Safety Score:</strong> 94%</span>
              </div>
            </div>

            <div style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: 8,
              padding: 14
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: '#92400e', fontSize: 13.5 }}>
                  🟡 NH-10 Gangtok-Siliguri Highway (HIGH RISK)
                </span>
                <span className="badge-status warning" style={{ fontSize: 10 }}>Soil Saturation</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#78350f', marginBottom: 8 }}>
                <strong>Recommended Alternative:</strong> Rangpo Valley Secondary Connector
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#475569', background: '#fff', padding: '6px 10px', borderRadius: 6 }}>
                <span><strong>Extra Distance:</strong> +18 km</span>
                <span><strong>Additional Time:</strong> +25 minutes</span>
                <span><strong>Safety Score:</strong> 88%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Deliveries + Live Emergency Alerts */}
      <div className="grid-2">
        {/* Critical Deliveries Real-Time Table */}
        <div className="card">
          <div className="card-header">
            <h3>🚑 Critical Essential Consignments</h3>
            <Link to="/logistics" className="card-action">Fleet Grid →</Link>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cargo</th>
                  <th>Destination</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Delay</th>
                </tr>
              </thead>
              <tbody>
                {criticalDeliveries.map(del => (
                  <tr key={del.deliveryId}>
                    <td><strong>{del.deliveryId}</strong></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {del.cargo === 'Medicines' ? '💊' : del.cargo === 'Food' ? '🌾' : del.cargo === 'Fuel' ? '⛽' : '📦'}
                        {del.cargo}
                      </span>
                    </td>
                    <td>{del.destination?.name || 'NER District Depot'}</td>
                    <td><span className="badge-status info" style={{ fontSize: 11 }}>{del.vehicleId}</span></td>
                    <td>
                      <span className={`badge-status ${del.status?.toLowerCase().replace(' ', '-')}`}>
                        {del.status}
                      </span>
                    </td>
                    <td style={{ color: del.delay > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                      {del.delay > 0 ? `+${del.delay}m` : 'On Schedule'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Emergency Alerts */}
        <div className="card">
          <div className="card-header">
            <h3>🚨 {getTranslation('criticalAlerts', currentLang)}</h3>
            <Link to="/alerts" className="card-action">All Alerts →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.length === 0 ? (
              <div style={{ padding: 16, color: '#94a3b8', textAlign: 'center', fontSize: 13 }}>
                ✅ All corridors clear. No critical alerts currently active.
              </div>
            ) : (
              alerts.map(alert => (
                <div className={`alert-item ${alert.severity?.toLowerCase()}`} key={alert.alertId}>
                  <span className="alert-icon">
                    {alert.severity === 'Critical' ? '🔴' : '🟡'}
                  </span>
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.message}</p>
                  </div>
                  <span className="alert-time">{timeAgo(alert.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
