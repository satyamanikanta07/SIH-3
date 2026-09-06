import { useState, useEffect } from 'react';
import { incidentsAPI, districtsAPI, uploadAPI } from '../services/api';
import { FiCheckCircle, FiSearch, FiAlertTriangle, FiCamera, FiX, FiFilter, FiExternalLink } from 'react-icons/fi';

const demoIncidents = [
  { incidentId: 'INC-0001', type: 'Landslide', location: { name: 'NH-2 near Kangpokpi', district: 'Imphal West' }, severity: 'Critical', description: 'Major landslide blocking NH-2. Large boulders on highway.', reportedBy: { name: 'Field Officer Marbaniang' }, status: 'Confirmed', createdAt: new Date(Date.now() - 7200000), affectedRoads: ['NH-02-MN'] },
  { incidentId: 'INC-0002', type: 'Flood', location: { name: 'Brahmaputra River Area, Tezpur', district: 'Sonitpur' }, severity: 'High', description: 'Rising water levels of Brahmaputra threatening NH-15 near Tezpur.', reportedBy: { name: 'District Officer Singh' }, status: 'Under Investigation', createdAt: new Date(Date.now() - 14400000), affectedRoads: ['NH-15-AS'] },
  { incidentId: 'INC-0003', type: 'Road Damage', location: { name: 'NH-39 Kohima Section', district: 'Kohima' }, severity: 'Critical', description: 'Severe road damage on NH-39 due to continuous heavy rainfall.', reportedBy: { name: 'Highway Engineer Lotha' }, status: 'Confirmed', createdAt: new Date(Date.now() - 10800000), affectedRoads: ['NH-39-NL'] },
  { incidentId: 'INC-0004', type: 'Bridge Damage', location: { name: 'Old Bridge near Nongpoh', district: 'Ri-Bhoi' }, severity: 'Medium', description: 'Structural cracks observed in old bridge near Nongpoh.', reportedBy: { name: 'PWD Inspector Khongwir' }, status: 'Under Investigation', createdAt: new Date(Date.now() - 21600000), affectedRoads: ['DR-01-RB'] },
  { incidentId: 'INC-0005', type: 'Weather Hazard', location: { name: 'NH-6 Aizawl-Silchar', district: 'Aizawl' }, severity: 'Critical', description: 'Dense fog and heavy rainfall causing near-zero visibility on NH-6.', reportedBy: { name: 'Traffic Controller Lalmuanpuia' }, status: 'Confirmed', createdAt: new Date(Date.now() - 3600000), affectedRoads: ['NH-06-MZ'] },
  { incidentId: 'INC-0006', type: 'Landslide', location: { name: 'NH-10 Near Rangpo', district: 'East Sikkim' }, severity: 'High', description: 'Minor landslide on NH-10 near Rangpo checkpoint.', reportedBy: { name: 'Border Officer Tamang' }, status: 'Reported', createdAt: new Date(Date.now() - 5400000), affectedRoads: ['NH-10-SK'] },
];

const typeEmoji = { Landslide: '⛰️', Flood: '🌊', 'Road Damage': '🚧', 'Bridge Damage': '🌉', 'Weather Hazard': '🌧️', 'Heavy Traffic': '🚗', 'Traffic Congestion': '🚗', Accident: '💥', Other: '⚠️' };
const statusStyles = { Reported: 'pending', 'Under Investigation': 'warning', Confirmed: 'critical', Resolved: 'safe' };

export default function Incidents({ user }) {
  const [incidents, setIncidents] = useState(demoIncidents);
  const [districtsList, setDistrictsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ type: '', severity: '', status: '', district: '' });
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const [newIncident, setNewIncident] = useState({
    type: 'Landslide',
    severity: 'Critical',
    description: '',
    location: { name: '', district: 'Imphal West', coordinates: { lat: 24.8170, lng: 93.9368 } },
    photograph: ''
  });

  const isAdmin = user?.role === 'admin';
  const isGovt = user?.role === 'government_official';
  const canReport = ['admin', 'government_official', 'field_officer'].includes(user?.role);
  const canUpdate = isAdmin || isGovt;

  useEffect(() => {
    // Load incidents from API
    incidentsAPI.getAll().then(res => {
      if (res?.data?.length) setIncidents(res.data);
    }).catch(() => {});

    // Load districts for filter
    districtsAPI.getAll().then(res => {
      if (res?.data?.length) setDistrictsList(res.data);
    }).catch(() => {});
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

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
      let uploadedPhotoUrl = '';
      if (photoFile) {
        setPhotoUploading(true);
        const formData = new FormData();
        formData.append('photo', photoFile);
        try {
          const uploadRes = await uploadAPI.uploadPhoto(formData);
          uploadedPhotoUrl = uploadRes?.url || '';
        } catch (uploadErr) {
          console.warn('Photo upload fallback to preview:', uploadErr);
          uploadedPhotoUrl = photoPreview; // fallback to base64
        }
        setPhotoUploading(false);
      }

      const payload = {
        ...newIncident,
        photograph: uploadedPhotoUrl,
        reportedBy: { name: user?.name || 'Field Reporter', role: user?.role || 'field_officer' },
        status: 'Reported',
        location: {
          ...newIncident.location,
          coordinates: { lat: 24.8 + Math.random() * 1.5, lng: 92.5 + Math.random() * 2 }
        }
      };

      const res = await incidentsAPI.create(payload);
      const created = res?.data || { ...payload, incidentId: `INC-${String(incidents.length + 1).padStart(4, '0')}`, createdAt: new Date() };

      setIncidents([created, ...incidents]);
      setNotice(`✅ Incident ${created.incidentId} successfully logged.`);
      setShowForm(false);
      setNewIncident({
        type: 'Landslide',
        severity: 'Critical',
        description: '',
        location: { name: '', district: 'Imphal West', coordinates: { lat: 24.8170, lng: 93.9368 } },
        photograph: ''
      });
      setPhotoFile(null);
      setPhotoPreview('');
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setPhotoUploading(false);
      setNotice(`❌ Error: ${err.message}`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  const filtered = incidents.filter(i => {
    if (filters.type && i.type !== filters.type) return false;
    if (filters.severity && i.severity !== filters.severity) return false;
    if (filters.status && i.status !== filters.status) return false;
    if (filters.district && (i.location?.district !== filters.district)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = i.incidentId?.toLowerCase().includes(q);
      const matchDesc = i.description?.toLowerCase().includes(q);
      const matchLoc = i.location?.name?.toLowerCase().includes(q);
      const matchDist = i.location?.district?.toLowerCase().includes(q);
      if (!matchId && !matchDesc && !matchLoc && !matchDist) return false;
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
          <p>Ground hazards, landslides, washouts, photo evidence verification, and status resolution workflows</p>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Report New Highway Incident</h3>
            <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => setShowForm(false)}>
              <FiX />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid-3">
              <div className="form-group">
                <label>Incident Type</label>
                <select className="form-control" value={newIncident.type} onChange={e => setNewIncident({ ...newIncident, type: e.target.value })}>
                  {['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Heavy Traffic', 'Traffic Congestion', 'Accident', 'Weather Hazard', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Severity</label>
                <select className="form-control" value={newIncident.severity} onChange={e => setNewIncident({ ...newIncident, severity: e.target.value })}>
                  {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>District</label>
                <select
                  className="form-control"
                  value={newIncident.location.district}
                  onChange={e => setNewIncident({ ...newIncident, location: { ...newIncident.location, district: e.target.value } })}
                >
                  {(districtsList.length > 0 ? districtsList.map(d => d.name) : ['Imphal West', 'East Khasi Hills', 'Ri-Bhoi', 'Sonitpur', 'Kohima', 'Aizawl', 'East Sikkim']).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Location Corridor Name</label>
              <input
                className="form-control"
                placeholder="e.g. NH-2 near Kangpokpi, KM Marker 45"
                value={newIncident.location.name}
                onChange={e => setNewIncident({ ...newIncident, location: { ...newIncident.location, name: e.target.value } })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Description & Field Details</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Describe size of debris, blocked lanes, and on-ground condition..."
                value={newIncident.description}
                onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Attach Evidence Photo (Ground Camera / File)</label>
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
                      onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={photoUploading}>
                {photoUploading ? 'Uploading Photo...' : 'Submit Incident'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="filters-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 36, height: 38 }}
            placeholder="Search by ID, corridor, details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select className="filter-select" style={{ height: 38 }} value={filters.district} onChange={e => setFilters({ ...filters, district: e.target.value })}>
          <option value="">All Districts</option>
          {(districtsList.length > 0 ? districtsList.map(d => d.name) : ['Imphal West', 'East Khasi Hills', 'Ri-Bhoi', 'Sonitpur', 'Kohima', 'Aizawl', 'East Sikkim']).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select className="filter-select" style={{ height: 38 }} value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          {['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Heavy Traffic', 'Traffic Congestion', 'Accident', 'Weather Hazard', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select className="filter-select" style={{ height: 38 }} value={filters.severity} onChange={e => setFilters({ ...filters, severity: e.target.value })}>
          <option value="">All Severity</option>
          {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="filter-select" style={{ height: 38 }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
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
                <th>Evidence Photo</th>
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
                  <td>
                    {inc.location?.name}
                    <br/>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{inc.location?.district}</span>
                  </td>
                  <td><span className={`badge-status ${inc.severity?.toLowerCase()}`}>{inc.severity}</span></td>
                  <td>
                    {inc.photograph ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoModal(inc.photograph)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                        title="Click to view full photo evidence"
                      >
                        <img
                          src={inc.photograph.startsWith('/') ? `http://localhost:5000${inc.photograph}` : inc.photograph}
                          alt="Evidence"
                          style={{ width: 44, height: 34, objectFit: 'cover', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x60?text=Photo'; }}
                        />
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td style={{ maxWidth: 240, whiteSpace: 'normal', lineHeight: 1.4, fontSize: 12.5 }}>{inc.description}</td>
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
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No incidents matching the filter or search query.
                  </td>
                </tr>
              )}
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
