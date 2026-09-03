import { useState, useEffect } from 'react';
import { auditLogsAPI } from '../services/api';

const demoDistricts = [
  { name: 'Kamrup Metropolitan', state: 'Assam', code: 'KAM', accessibilityScore: 92, totalRoads: 340, openRoads: 310, riskyRoads: 22, blockedRoads: 8, activeIncidents: 2, activeVehicles: 45, criticalDeliveries: 3, riskLevel: 'Low', weatherCondition: 'Light Rain', temp: 28, rainfall: 45 },
  { name: 'East Khasi Hills', state: 'Meghalaya', code: 'EKH', accessibilityScore: 72, totalRoads: 210, openRoads: 152, riskyRoads: 38, blockedRoads: 20, activeIncidents: 5, activeVehicles: 18, criticalDeliveries: 4, riskLevel: 'Medium', weatherCondition: 'Heavy Rain', temp: 20, rainfall: 165 },
  { name: 'Imphal West', state: 'Manipur', code: 'IMW', accessibilityScore: 68, totalRoads: 185, openRoads: 128, riskyRoads: 35, blockedRoads: 22, activeIncidents: 3, activeVehicles: 12, criticalDeliveries: 2, riskLevel: 'Medium', weatherCondition: 'Heavy Rain', temp: 25, rainfall: 78 },
  { name: 'Aizawl', state: 'Mizoram', code: 'AIZ', accessibilityScore: 65, totalRoads: 160, openRoads: 105, riskyRoads: 32, blockedRoads: 23, activeIncidents: 6, activeVehicles: 8, criticalDeliveries: 5, riskLevel: 'High', weatherCondition: 'Storm', temp: 22, rainfall: 145 },
  { name: 'Dimapur', state: 'Nagaland', code: 'DIM', accessibilityScore: 70, totalRoads: 175, openRoads: 122, riskyRoads: 33, blockedRoads: 20, activeIncidents: 4, activeVehicles: 15, criticalDeliveries: 3, riskLevel: 'Medium', weatherCondition: 'Cloudy', temp: 27, rainfall: 55 },
  { name: 'East Sikkim', state: 'Sikkim', code: 'ESK', accessibilityScore: 60, totalRoads: 140, openRoads: 88, riskyRoads: 30, blockedRoads: 22, activeIncidents: 4, activeVehicles: 6, criticalDeliveries: 4, riskLevel: 'High', weatherCondition: 'Heavy Rain', temp: 18, rainfall: 95 },
  { name: 'West Tripura', state: 'Tripura', code: 'WTR', accessibilityScore: 78, totalRoads: 195, openRoads: 155, riskyRoads: 25, blockedRoads: 15, activeIncidents: 1, activeVehicles: 20, criticalDeliveries: 1, riskLevel: 'Low', weatherCondition: 'Cloudy', temp: 30, rainfall: 15 },
  { name: 'Kohima', state: 'Nagaland', code: 'KOH', accessibilityScore: 58, totalRoads: 145, openRoads: 85, riskyRoads: 35, blockedRoads: 25, activeIncidents: 7, activeVehicles: 5, criticalDeliveries: 6, riskLevel: 'High', weatherCondition: 'Heavy Rain', temp: 21, rainfall: 110 },
  { name: 'West Garo Hills', state: 'Meghalaya', code: 'WGH', accessibilityScore: 55, totalRoads: 130, openRoads: 72, riskyRoads: 35, blockedRoads: 23, activeIncidents: 5, activeVehicles: 4, criticalDeliveries: 3, riskLevel: 'High', weatherCondition: 'Heavy Rain', temp: 24, rainfall: 130 },
  { name: 'Sonitpur', state: 'Assam', code: 'SON', accessibilityScore: 80, totalRoads: 260, openRoads: 210, riskyRoads: 30, blockedRoads: 20, activeIncidents: 3, activeVehicles: 25, criticalDeliveries: 2, riskLevel: 'Low', weatherCondition: 'Heavy Rain', temp: 28, rainfall: 70 },
  { name: 'Ri-Bhoi', state: 'Meghalaya', code: 'RBH', accessibilityScore: 66, totalRoads: 155, openRoads: 102, riskyRoads: 30, blockedRoads: 23, activeIncidents: 2, activeVehicles: 10, criticalDeliveries: 2, riskLevel: 'Medium', weatherCondition: 'Heavy Rain', temp: 22, rainfall: 100 },
  { name: 'Tinsukia', state: 'Assam', code: 'TIN', accessibilityScore: 75, totalRoads: 220, openRoads: 168, riskyRoads: 30, blockedRoads: 22, activeIncidents: 2, activeVehicles: 18, criticalDeliveries: 1, riskLevel: 'Medium', weatherCondition: 'Cloudy', temp: 29, rainfall: 35 },
];

const riskColors = { Low: '#059669', Medium: '#d97706', High: '#dc2626', Critical: '#dc2626' };

export default function Settings({ user }) {
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const canViewAudit = ['admin', 'government_official'].includes(user?.role);

  useEffect(() => {
    if (canViewAudit) {
      auditLogsAPI.getAll().then(res => {
        if (res?.data?.length) setAuditLogs(res.data);
      }).catch(() => {});
    }
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Settings & District View</h2>
          <p>Platform settings, district surveillance, and governance audit trails</p>
        </div>
      </div>

      {/* User Info */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3>👤 User Profile & Role Privileges</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div><span style={{ fontSize: 12, color: '#94a3b8' }}>Name</span><div style={{ fontWeight: 600 }}>{user?.name || 'Admin User'}</div></div>
          <div><span style={{ fontSize: 12, color: '#94a3b8' }}>Email</span><div style={{ fontWeight: 600 }}>{user?.email || 'admin@nerlogistics.gov.in'}</div></div>
          <div><span style={{ fontSize: 12, color: '#94a3b8' }}>Role</span><div style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--primary)' }}>{user?.role?.replace('_', ' ') || 'Admin'}</div></div>
          <div><span style={{ fontSize: 12, color: '#94a3b8' }}>Access Zone</span><div style={{ fontWeight: 600 }}>All 8 North Eastern States</div></div>
        </div>
      </div>

      {/* District View */}
      <div className="grid-2-1" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>🏘️ District Overview</h3></div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>State</th>
                  <th>Score</th>
                  <th>Risk</th>
                  <th>Roads</th>
                  <th>Incidents</th>
                  <th>Weather</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {demoDistricts.map(d => (
                  <tr key={d.code} style={{ cursor: 'pointer', background: selectedDistrict?.code === d.code ? '#eff6ff' : '' }} onClick={() => setSelectedDistrict(d)}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.state}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${d.accessibilityScore}%`, height: '100%', background: d.accessibilityScore >= 75 ? '#059669' : d.accessibilityScore >= 60 ? '#d97706' : '#dc2626', borderRadius: 3 }}></div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{d.accessibilityScore}%</span>
                      </div>
                    </td>
                    <td><span className={`badge-status ${d.riskLevel.toLowerCase()}`}>{d.riskLevel}</span></td>
                    <td style={{ fontSize: 12 }}>🟢{d.openRoads} 🟡{d.riskyRoads} 🔴{d.blockedRoads}</td>
                    <td>{d.activeIncidents}</td>
                    <td style={{ fontSize: 12 }}>{d.weatherCondition}</td>
                    <td><button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 11 }}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected District Detail */}
        <div>
          {selectedDistrict ? (
            <div className="card">
              <div className="card-header"><h3>📍 {selectedDistrict.name}</h3></div>
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: selectedDistrict.accessibilityScore >= 75 ? '#059669' : selectedDistrict.accessibilityScore >= 60 ? '#d97706' : '#dc2626' }}>
                  {selectedDistrict.accessibilityScore}%
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>Accessibility Score</div>
                <span className={`badge-status ${selectedDistrict.riskLevel.toLowerCase()}`} style={{ marginTop: 8, display: 'inline-flex' }}>
                  {selectedDistrict.riskLevel} RISK
                </span>
              </div>

              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>State</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedDistrict.state}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Total Roads</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedDistrict.totalRoads}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Open Roads</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#059669' }}>{selectedDistrict.openRoads}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Risky Roads</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#d97706' }}>{selectedDistrict.riskyRoads}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Blocked Roads</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#dc2626' }}>{selectedDistrict.blockedRoads}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Active Incidents</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedDistrict.activeIncidents}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Active Vehicles</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedDistrict.activeVehicles}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Weather</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedDistrict.weatherCondition} ({selectedDistrict.temp}°C)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Rainfall</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedDistrict.rainfall} mm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Critical Deliveries</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#dc2626' }}>{selectedDistrict.criticalDeliveries}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <div className="icon">🏘️</div>
                <p>Select a district to view detailed information</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Governance Audit Log Table (Admin & Govt Official) */}
      {canViewAudit && (
        <div className="card">
          <div className="card-header">
            <h3>🔒 Multi-Agency Security & Activity Audit Trail</h3>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Operator</th>
                  <th>Role</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length > 0 ? (
                  auditLogs.map(log => (
                    <tr key={log._id || log.id}>
                      <td><span style={{ fontSize: 12, color: '#64748b' }}>{new Date(log.timestamp || log.createdAt).toLocaleString()}</span></td>
                      <td><span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 12 }}>{log.action}</span></td>
                      <td><span className="badge-status info">{log.entityType} ({log.entityId})</span></td>
                      <td>{log.userName}</td>
                      <td><span style={{ fontSize: 11, textTransform: 'capitalize' }}>{log.userRole?.replace('_', ' ')}</span></td>
                      <td style={{ fontSize: 12, color: '#334155' }}>
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      Audit logs will automatically record every road modification, incident resolution, dispatch, and alert broadcast here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
