import { useState, useEffect } from 'react';
import { incidentsAPI } from '../services/api';
import { FiCheckCircle, FiSearch, FiAlertTriangle } from 'react-icons/fi';

const demoIncidents = [
  { incidentId: 'INC-0001', type: 'Landslide', location: { name: 'NH-2 near Kangpokpi', district: 'Imphal West' }, severity: 'Critical', description: 'Major landslide blocking NH-2. Large boulders on highway.', reportedBy: { name: 'Field Officer Marbaniang' }, status: 'Confirmed', createdAt: new Date(Date.now() - 7200000), affectedRoads: ['NH-02-MN'] },
  { incidentId: 'INC-0002', type: 'Flood', location: { name: 'Brahmaputra River Area, Tezpur', district: 'Sonitpur' }, severity: 'High', description: 'Rising water levels of Brahmaputra threatening NH-15 near Tezpur.', reportedBy: { name: 'District Officer Singh' }, status: 'Under Investigation', createdAt: new Date(Date.now() - 14400000), affectedRoads: ['NH-15-AS'] },
  { incidentId: 'INC-0003', type: 'Road Damage', location: { name: 'NH-39 Kohima Section', district: 'Kohima' }, severity: 'Critical', description: 'Severe road damage on NH-39 due to continuous heavy rainfall.', reportedBy: { name: 'Highway Engineer Lotha' }, status: 'Confirmed', createdAt: new Date(Date.now() - 10800000), affectedRoads: ['NH-39-NL'] },
  { incidentId: 'INC-0004', type: 'Bridge Damage', location: { name: 'Old Bridge near Nongpoh', district: 'Ri-Bhoi' }, severity: 'Medium', description: 'Structural cracks observed in old bridge near Nongpoh.', reportedBy: { name: 'PWD Inspector Khongwir' }, status: 'Under Investigation', createdAt: new Date(Date.now() - 21600000), affectedRoads: ['DR-01-RB'] },
  { incidentId: 'INC-0005', type: 'Weather Hazard', location: { name: 'NH-6 Aizawl-Silchar', district: 'Aizawl' }, severity: 'Critical', description: 'Dense fog and heavy rainfall causing near-zero visibility on NH-6.', reportedBy: { name: 'Traffic Controller Lalmuanpuia' }, status: 'Confirmed', createdAt: new Date(Date.now() - 3600000), affectedRoads: ['NH-06-MZ'] },
  { incidentId: 'INC-0006', type: 'Landslide', location: { name: 'NH-10 Near Rangpo', district: 'East Sikkim' }, severity: 'High', description: 'Minor landslide on NH-10 near Rangpo checkpoint.', reportedBy: { name: 'Border Officer Tamang' }, status: 'Reported', createdAt: new Date(Date.now() - 5400000), affectedRoads: ['NH-10-SK'] },
];

const typeEmoji = { Landslide: '⛰️', Flood: '🌊', 'Road Damage': '🚧', 'Bridge Damage': '🌉', 'Weather Hazard': '🌧️', 'Heavy Traffic': '🚗', Accident: '💥', Other: '⚠️' };
const statusStyles = { Reported: 'pending', 'Under Investigation': 'warning', Confirmed: 'critical', Resolved: 'safe' };

export default function Incidents({ user }) {
  const [incidents, setIncidents] = useState(demoIncidents);
  const [filters, setFilters] = useState({ type: '', severity: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [newIncident, setNewIncident] = useState({
    type: 'Landslide',
    severity: 'Critical',
    description: '',
    location: { name: '', district: 'Imphal West', coordinates: { lat: 25.5, lng: 91.8 } }
  });

  const isAdmin = user?.role === 'admin';
  const isGovt = user?.role === 'government_official';
  const canReport = ['admin', 'government_official', 'field_officer'].includes(user?.role);
  const canUpdate = isAdmin || isGovt;

  useEffect(() => {
    incidentsAPI.getAll().then(res => {
      if (res?.data?.length) setIncidents(res.data);
    }).catch(() => {});
  }, []);

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await incidentsAPI.update(incidentId, { status: newStatus });
      setIncidents(prev => prev.map(inc =>
        inc.incidentId === incidentId ? { ...inc, status: newStatus } : inc
      ));
      setNotice(`✅ Incident ${incidentId} transitioned to ${newStatus.toUpperCase()}`);
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setNotice(`❌ ${err.message || 'Failed to update incident status'}`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newIncident,
        reportedBy: { name: user?.name || 'Field Reporter', role: user?.role || 'field_officer' },
        status: 'Reported',
        location: {
          ...newIncident.location,
          coordinates: { lat: 25.5 + Math.random() * 0.5, lng: 91.5 + Math.random() * 2 }
        }
      };

      const res = await incidentsAPI.create(payload);
      const created = res?.data || { ...payload, incidentId: `INC-${String(incidents.length + 1).padStart(4, '0')}`, createdAt: new Date() };

      setIncidents([created, ...incidents]);
      setNotice(`✅ Incident ${created.incidentId} successfully logged.`);
      setShowForm(false);
      setNewIncident({ type: 'Landslide', severity: 'Critical', description: '', location: { name: '', district: 'Imphal West' } });
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setNotice(`❌ Error: ${err.message}`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  const filtered = incidents.filter(i => {
    if (filters.type && i.type !== filters.type) return false;
    if (filters.severity && i.severity !== filters.severity) return false;
    if (filters.status && i.status !== filters.status) return false;
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
          background: notice.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          color: notice.startsWith('✅') ? '#15803d' : '#b91c1c',
          border: `1px solid ${notice.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`
        }}>
          {notice}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Incident & Disaster Management</h2>
          <p>Ground hazards, landslides, washouts, and status resolution workflows</p>
        </div>
        {canReport && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + Report Incident
          </button>
        )}
      </div>

      {/* Incident Form (Admin, Govt, Field Officer) */}
      {showForm && canReport && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Report New Highway Incident</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-3">
              <div className="form-group">
                <label>Incident Type</label>
                <select className="form-control" value={newIncident.type} onChange={e => setNewIncident({ ...newIncident, type: e.target.value })}>
                  {['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Heavy Traffic', 'Accident', 'Weather Hazard'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Severity</label>
                <select className="form-control" value={newIncident.severity} onChange={e => setNewIncident({ ...newIncident, severity: e.target.value })}>
                  {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location Corridor</label>
                <input className="form-control" placeholder="e.g. NH-2 near Kangpokpi" value={newIncident.location.name} onChange={e => setNewIncident({ ...newIncident, location: { ...newIncident.location, name: e.target.value } })} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Description & Field Details</label>
              <textarea className="form-control" rows={2} placeholder="Describe size of debris, blocked lanes, and on-ground condition..." value={newIncident.description} onChange={e => setNewIncident({ ...newIncident, description: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">Submit Incident</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Bar */}
      <div className="filters-bar">
        <select className="filter-select" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          {['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Heavy Traffic', 'Accident', 'Weather Hazard'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filter-select" value={filters.severity} onChange={e => setFilters({ ...filters, severity: e.target.value })}>
          <option value="">All Severity</option>
          {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {['Reported', 'Under Investigation', 'Confirmed', 'Resolved'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Incident Records Table */}
      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Reported By</th>
                <th>Status</th>
                <th>Action & Workflow</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <tr key={inc.incidentId}>
                  <td><strong>{inc.incidentId}</strong></td>
                  <td>{typeEmoji[inc.type] || '⚠️'} {inc.type}</td>
                  <td>{inc.location?.name}<br/><span style={{ fontSize: 11, color: '#94a3b8' }}>{inc.location?.district}</span></td>
                  <td><span className={`badge-status ${inc.severity?.toLowerCase()}`}>{inc.severity}</span></td>
                  <td style={{ maxWidth: 260, whiteSpace: 'normal', lineHeight: 1.4, fontSize: 12.5 }}>{inc.description}</td>
                  <td>{inc.reportedBy?.name || 'Field Officer'}</td>
                  <td><span className={`badge-status ${statusStyles[inc.status] || 'info'}`}>{inc.status}</span></td>
                  <td>
                    {/* Role-Based Workflow Buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {canUpdate && inc.status === 'Reported' && (
                        <>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleStatusChange(inc.incidentId, 'Under Investigation')}
                            title="Assign to investigation"
                          >
                            Investigate
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            onClick={() => handleStatusChange(inc.incidentId, 'Confirmed')}
                            title="Confirm ground report"
                          >
                            Confirm
                          </button>
                        </>
                      )}

                      {canUpdate && inc.status === 'Under Investigation' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                          onClick={() => handleStatusChange(inc.incidentId, 'Confirmed')}
                        >
                          Confirm
                        </button>
                      )}

                      {inc.status === 'Confirmed' && (
                        <>
                          {isAdmin ? (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '3px 8px', fontSize: 11, background: '#059669', borderColor: '#059669' }}
                              onClick={() => handleStatusChange(inc.incidentId, 'Resolved')}
                            >
                              Resolve
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: '#d97706', fontStyle: 'italic' }}>
                              Awaiting Admin Resolution
                            </span>
                          )}
                        </>
                      )}

                      {inc.status === 'Resolved' && (
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiCheckCircle /> Closed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No incidents matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
