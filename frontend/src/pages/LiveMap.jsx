import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { roadsAPI, vehiclesAPI, incidentsAPI } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (emoji, size = 28) => L.divIcon({
  html: `<div style="font-size:${size}px;text-align:center;line-height:1">${emoji}</div>`,
  className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
});

const initialRoads = [
  { id: 'NH-27-01', roadId: 'NH-27-01', name: 'NH-27 Guwahati-Shillong Highway', points: [[26.1445, 91.7362], [25.88, 91.86], [25.5788, 91.8933]], status: 'Open', risk: 'Medium', traffic: 'Heavy', disruption: 42, rainfall: 45 },
  { id: 'NH-37-01', roadId: 'NH-37-01', name: 'NH-37 Guwahati-Dimapur', points: [[26.1445, 91.7362], [26.3, 92.5], [25.9065, 93.7272]], status: 'Open', risk: 'Low', traffic: 'Moderate', disruption: 18, rainfall: 30 },
  { id: 'NH-02-MN', roadId: 'NH-02-MN', name: 'NH-2 Imphal-Dimapur Highway', points: [[24.8170, 93.9368], [25.3, 93.82], [25.9065, 93.7272]], status: 'Risky', risk: 'High', traffic: 'Heavy', disruption: 78, rainfall: 95 },
  { id: 'NH-06-MZ', roadId: 'NH-06-MZ', name: 'NH-6 Aizawl-Silchar Road', points: [[23.7271, 92.7176], [24.2, 92.75], [24.8333, 92.7789]], status: 'Blocked', risk: 'Critical', traffic: 'Standstill', disruption: 95, rainfall: 145 },
  { id: 'NH-10-SK', roadId: 'NH-10-SK', name: 'NH-10 Gangtok-Siliguri Highway', points: [[27.3389, 88.6065], [27.0, 88.5], [26.7271, 88.3953]], status: 'Risky', risk: 'High', traffic: 'Heavy', disruption: 65, rainfall: 95 },
  { id: 'SH-01-ML', roadId: 'SH-01-ML', name: 'Shillong-Dawki Road', points: [[25.5788, 91.8933], [25.38, 91.95], [25.1873, 92.0238]], status: 'Open', risk: 'Medium', traffic: 'Moderate', disruption: 35, rainfall: 80 },
  { id: 'SH-02-TR', roadId: 'SH-02-TR', name: 'Agartala-Udaipur Road', points: [[23.8315, 91.2868], [23.68, 91.38], [23.5333, 91.4833]], status: 'Open', risk: 'Low', traffic: 'Low', disruption: 12, rainfall: 15 },
  { id: 'NH-39-NL', roadId: 'NH-39-NL', name: 'NH-39 Kohima-Imphal', points: [[25.6586, 94.1086], [25.2, 94.0], [24.8170, 93.9368]], status: 'Blocked', risk: 'Critical', traffic: 'Standstill', disruption: 92, rainfall: 110 },
  { id: 'SH-03-WG', roadId: 'SH-03-WG', name: 'Tura-Dalu Road', points: [[25.5166, 90.2223], [25.37, 90.20], [25.2250, 90.1766]], status: 'Risky', risk: 'High', traffic: 'Moderate', disruption: 58, rainfall: 130 },
  { id: 'NH-15-AS', roadId: 'NH-15-AS', name: 'NH-15 Tezpur Highway', points: [[26.6800, 92.9800], [26.4, 92.2], [26.1445, 91.7362]], status: 'Open', risk: 'Low', traffic: 'Moderate', disruption: 15, rainfall: 70 },
];

const initialVehicles = [
  { id: 'NER-101', vehicleId: 'NER-101', lat: 26.12, lng: 91.85, cargo: 'Medicines', status: 'Moving', driver: 'Rajesh Kumar', speed: 35, dest: 'Shillong', priority: 'Critical' },
  { id: 'NER-102', vehicleId: 'NER-102', lat: 25.65, lng: 91.90, cargo: 'Food', status: 'Moving', driver: 'Bimal Das', speed: 28, dest: 'Tura', priority: 'High' },
  { id: 'NER-103', vehicleId: 'NER-103', lat: 24.90, lng: 93.88, cargo: 'Emergency', status: 'Moving', driver: 'Tomba Singh', speed: 42, dest: 'Churachandpur', priority: 'Critical' },
  { id: 'NER-104', vehicleId: 'NER-104', lat: 26.85, lng: 93.50, cargo: 'Construction', status: 'Delayed', driver: 'Abdul Rahman', speed: 0, dest: 'Dimapur', priority: 'Medium' },
  { id: 'NER-105', vehicleId: 'NER-105', lat: 27.20, lng: 88.55, cargo: 'Medicines', status: 'At Risk', driver: 'Pempa Sherpa', speed: 15, dest: 'Gangtok', priority: 'Critical' },
  { id: 'NER-106', vehicleId: 'NER-106', lat: 23.78, lng: 91.35, cargo: 'Agricultural', status: 'Moving', driver: 'Subhash Debnath', speed: 38, dest: 'Udaipur', priority: 'Medium' },
  { id: 'NER-107', vehicleId: 'NER-107', lat: 25.85, lng: 93.80, cargo: 'Fuel', status: 'Stopped', driver: 'Kevi Zhimo', speed: 0, dest: 'Kohima', priority: 'High' },
  { id: 'NER-108', vehicleId: 'NER-108', lat: 23.80, lng: 92.72, cargo: 'Food', status: 'Delayed', driver: 'Lalthianga', speed: 0, dest: 'Aizawl', priority: 'Critical' },
];

const initialIncidents = [
  { id: 'INC-0001', lat: 25.65, lng: 91.88, type: 'Landslide', severity: 'Critical', desc: 'Major landslide blocking NH-27 near Umiam Lake' },
  { id: 'INC-0002', lat: 26.63, lng: 92.80, type: 'Flood', severity: 'High', desc: 'Brahmaputra water level above danger mark' },
  { id: 'INC-0003', lat: 25.70, lng: 94.05, type: 'Road Damage', severity: 'Critical', desc: 'Severe road damage on NH-39' },
  { id: 'INC-0004', lat: 25.90, lng: 91.87, type: 'Bridge Damage', severity: 'Medium', desc: 'Structural cracks in old bridge' },
  { id: 'INC-0005', lat: 23.75, lng: 92.73, type: 'Weather Hazard', severity: 'Critical', desc: 'Dense fog and heavy rainfall on NH-6' },
  { id: 'INC-0006', lat: 27.18, lng: 88.53, type: 'Landslide', severity: 'High', desc: 'Minor landslide near Rangpo' },
  { id: 'INC-0007', lat: 25.91, lng: 93.73, type: 'Heavy Traffic', severity: 'Low', desc: 'Traffic congestion at Dimapur market' },
];

const statusColors = { Open: '#059669', Risky: '#d97706', Blocked: '#dc2626' };
const severityEmoji = { Critical: '🔴', High: '🟠', Medium: '🟡', Low: '🟢' };

export default function LiveMap({ user }) {
  const [roads, setRoads] = useState(initialRoads);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [filters, setFilters] = useState({ roads: true, vehicles: true, incidents: true, status: 'All' });
  const [notice, setNotice] = useState('');
  const [editingRoad, setEditingRoad] = useState(null);
  const [editStatus, setEditStatus] = useState('Blocked');
  const [editReason, setEditReason] = useState('Severe Landslide');
  const [saving, setSaving] = useState(false);

  // Check if role has road modification authority
  const canModifyRoad = ['admin', 'government_official'].includes(user?.role);

  useEffect(() => {
    roadsAPI.getAll().then(res => {
      if (res?.data?.length) {
        setRoads(prev => prev.map(pr => {
          const matched = res.data.find(r => r.roadId === pr.id || r.roadId === pr.roadId);
          return matched ? { ...pr, status: matched.status, risk: matched.riskLevel || pr.risk } : pr;
        }));
      }
    }).catch(() => {});

    vehiclesAPI.getAll().then(res => {
      if (res?.data?.length) {
        setVehicles(prev => prev.map(pv => {
          const matched = res.data.find(v => v.vehicleId === pv.id || v.vehicleId === pv.vehicleId);
          return matched ? {
            ...pv,
            lat: matched.currentLocation?.lat || pv.lat,
            lng: matched.currentLocation?.lng || pv.lng,
            speed: matched.currentSpeed !== undefined ? matched.currentSpeed : pv.speed,
            fuel: matched.fuelLevel || pv.fuel,
            status: matched.status || pv.status
          } : pv;
        }));
      }
    }).catch(() => {});
  }, []);

  const handleOpenEditModal = (road) => {
    setEditingRoad(road);
    setEditStatus(road.status);
    setEditReason(road.status === 'Blocked' ? 'Road clearance in progress' : 'Landslide alert');
  };

  const handleSaveRoadStatus = async () => {
    if (!editingRoad) return;
    setSaving(true);
    try {
      await roadsAPI.update(editingRoad.roadId || editingRoad.id, {
        status: editStatus,
        reason: editReason
      });

      setRoads(prev => prev.map(r =>
        (r.id === editingRoad.id || r.roadId === editingRoad.roadId)
          ? { ...r, status: editStatus }
          : r
      ));

      setNotice(`✅ Road ${editingRoad.name} status successfully updated to ${editStatus.toUpperCase()}`);
      setTimeout(() => setNotice(''), 5000);
      setEditingRoad(null);
    } catch (err) {
      setNotice(`❌ Error: ${err.message || 'Failed to update road status.'}`);
      setTimeout(() => setNotice(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const filteredRoads = roads.filter(r => filters.roads && (filters.status === 'All' || r.status === filters.status));

  return (
    <div>
      {/* Action Notification Banner */}
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

      {/* Road Edit Modal (Admin & Govt Official Only) */}
      {editingRoad && canModifyRoad && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
              Edit Corridor Status
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              {editingRoad.name} ({editingRoad.roadId || editingRoad.id})
            </p>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Status
              </label>
              <select
                className="form-control"
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
              >
                <option value="Open">🟢 Open</option>
                <option value="Risky">🟡 Risky</option>
                <option value="Blocked">🔴 Blocked</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Reason / Field Observation
              </label>
              <input
                className="form-control"
                value={editReason}
                onChange={e => setEditReason(e.target.value)}
                placeholder="e.g. Major landslide, flash flood, or clearance complete"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-outline"
                onClick={() => setEditingRoad(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveRoadStatus}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="filters-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.roads} onChange={e => setFilters({ ...filters, roads: e.target.checked })} /> Roads
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.vehicles} onChange={e => setFilters({ ...filters, vehicles: e.target.checked })} /> Vehicles
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.incidents} onChange={e => setFilters({ ...filters, incidents: e.target.checked })} /> Incidents
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="All">All Road Status</option>
            <option value="Open">Open</option>
            <option value="Risky">Risky</option>
            <option value="Blocked">Blocked</option>
          </select>
          {canModifyRoad && (
            <span style={{ fontSize: 12, background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
              ✏️ Road Editing Enabled
            </span>
          )}
        </div>
      </div>

      {/* Full Page Map */}
      <div className="map-container fullpage">
        <MapContainer center={[25.5, 92.0]} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Roads */}
          {filteredRoads.map(road => (
            <Polyline key={road.id} positions={road.points} color={statusColors[road.status]} weight={6} opacity={0.85}>
              <Popup>
                <div className="popup-title">{road.name}</div>
                <div className="popup-row"><span className="popup-label">Road ID:</span><span className="popup-value">{road.roadId || road.id}</span></div>
                <div className="popup-row"><span className="popup-label">Status:</span><span className="popup-value" style={{ color: statusColors[road.status], fontWeight: 700 }}>{road.status.toUpperCase()}</span></div>
                <div className="popup-row"><span className="popup-label">Risk Level:</span><span className="popup-value">{road.risk}</span></div>
                <div className="popup-row"><span className="popup-label">Disruption:</span><span className="popup-value">{road.disruption}%</span></div>
                <div className="popup-row"><span className="popup-label">Traffic:</span><span className="popup-value">{road.traffic}</span></div>
                <div className="popup-row"><span className="popup-label">Rainfall:</span><span className="popup-value">{road.rainfall} mm</span></div>

                {/* Edit Button for Admin & Government Official */}
                {canModifyRoad && (
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '6px', fontSize: 12, justifyContent: 'center' }}
                      onClick={() => handleOpenEditModal(road)}
                    >
                      ✏️ Edit Road Status
                    </button>
                  </div>
                )}
              </Popup>
            </Polyline>
          ))}

          {/* Vehicles */}
          {filters.vehicles && vehicles.map(v => (
            <Marker key={v.id || v.vehicleId} position={[v.lat, v.lng]} icon={createIcon(v.status === 'Delayed' ? '🚛' : v.status === 'At Risk' ? '⚠️' : '🚛')}>
              <Popup>
                <div className="popup-title">{v.id || v.vehicleId}</div>
                <div className="popup-row"><span className="popup-label">Driver:</span><span className="popup-value">{typeof v.driver === 'object' ? v.driver?.name : v.driver}</span></div>
                <div className="popup-row"><span className="popup-label">Cargo:</span><span className="popup-value">{v.cargo}</span></div>
                <div className="popup-row"><span className="popup-label">Priority:</span><span className="popup-value">{v.priority}</span></div>
                <div className="popup-row"><span className="popup-label">Status:</span><span className="popup-value">{v.status}</span></div>
                <div className="popup-row"><span className="popup-label">Speed:</span><span className="popup-value">{v.speed} km/h</span></div>
                <div className="popup-row"><span className="popup-label">Destination:</span><span className="popup-value">{v.dest || v.destination?.name}</span></div>
              </Popup>
            </Marker>
          ))}

          {/* Incidents */}
          {filters.incidents && incidents.map(inc => (
            <Marker key={inc.id || inc.incidentId} position={[inc.lat || inc.location?.coordinates?.lat || 25.5, inc.lng || inc.location?.coordinates?.lng || 91.8]} icon={createIcon(severityEmoji[inc.severity] || '🟡', 22)}>
              <Popup>
                <div className="popup-title">{inc.id || inc.incidentId} - {inc.type}</div>
                <div className="popup-row"><span className="popup-label">Severity:</span><span className="popup-value">{inc.severity}</span></div>
                <div style={{ fontSize: 12, marginTop: 4, color: '#475569' }}>{inc.desc || inc.description}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div style={{ display: 'flex', gap: 20, padding: '12px 0', fontSize: 12, color: '#475569', flexWrap: 'wrap' }}>
        <span>🚛 Active Fleet Vehicle</span>
        <span>🔴 Critical Incident</span>
        <span>🟡 Warning / Road Hazard</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 20, height: 4, background: '#059669', display: 'inline-block' }}></span> Open Corridor</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 20, height: 4, background: '#d97706', display: 'inline-block' }}></span> Risky Corridor</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 20, height: 4, background: '#dc2626', display: 'inline-block' }}></span> Blocked Corridor</span>
      </div>
    </div>
  );
}
