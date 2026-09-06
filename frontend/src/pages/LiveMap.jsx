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

const createIcon = (emoji, size = 26) => L.divIcon({
  html: `<div style="font-size:${size}px;text-align:center;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${emoji}</div>`,
  className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
});

const ROAD_COORDINATES = {
  'NH-27-01': [[26.1445, 91.7362], [25.88, 91.86], [25.5788, 91.8933]],
  'NH-37-01': [[26.1445, 91.7362], [26.3, 92.5], [25.9065, 93.7272]],
  'NH-02-MN': [[24.8170, 93.9368], [25.3, 93.82], [25.9065, 93.7272]],
  'NH-06-MZ': [[23.7271, 92.7176], [24.2, 92.75], [24.8333, 92.7789]],
  'NH-10-SK': [[27.3389, 88.6065], [27.0, 88.5], [26.7271, 88.3953]],
  'SH-01-ML': [[25.5788, 91.8933], [25.38, 91.95], [25.1873, 92.0238]],
  'SH-02-TR': [[23.8315, 91.2868], [23.68, 91.38], [23.5333, 91.4833]],
  'NH-39-NL': [[25.6586, 94.1086], [25.2, 94.0], [24.8170, 93.9368]],
  'SH-03-WG': [[25.5166, 90.2223], [25.37, 90.20], [25.2250, 90.1766]],
  'NH-15-AS': [[26.6800, 92.9800], [26.4, 92.2], [26.1445, 91.7362]],
  'NH-29-AS': [[27.4889, 95.3547], [27.52, 95.45], [27.5697, 95.5719]],
  'BR-01-KAM': [[26.2000, 91.7200], [26.1700, 91.7300]],
  'DR-01-RB': [[25.8800, 91.8600], [25.77, 91.87], [25.6700, 91.8800]],
  'DR-02-DIM': [[25.9065, 93.7272], [25.75, 93.9], [25.6586, 94.1086]],
};

const initialRoads = [
  { id: 'NH-27-01', roadId: 'NH-27-01', name: 'NH-27 Guwahati-Shillong Highway', points: ROAD_COORDINATES['NH-27-01'], status: 'Open', risk: 'Medium', traffic: 'Heavy', disruption: 42, rainfall: 45 },
  { id: 'NH-02-MN', roadId: 'NH-02-MN', name: 'NH-2 Imphal-Dimapur Highway', points: ROAD_COORDINATES['NH-02-MN'], status: 'Risky', risk: 'High', traffic: 'Heavy', disruption: 78, rainfall: 95 },
  { id: 'NH-06-MZ', roadId: 'NH-06-MZ', name: 'NH-6 Aizawl-Silchar Road', points: ROAD_COORDINATES['NH-06-MZ'], status: 'Blocked', risk: 'Critical', traffic: 'Standstill', disruption: 95, rainfall: 145 },
  { id: 'NH-10-SK', roadId: 'NH-10-SK', name: 'NH-10 Gangtok-Siliguri Highway', points: ROAD_COORDINATES['NH-10-SK'], status: 'Risky', risk: 'High', traffic: 'Heavy', disruption: 65, rainfall: 95 },
  { id: 'NH-39-NL', roadId: 'NH-39-NL', name: 'NH-39 Kohima-Imphal', points: ROAD_COORDINATES['NH-39-NL'], status: 'Blocked', risk: 'Critical', traffic: 'Standstill', disruption: 92, rainfall: 110 },
  { id: 'BR-01-KAM', roadId: 'BR-01-KAM', name: 'Saraighat Bridge', points: ROAD_COORDINATES['BR-01-KAM'], type: 'Bridge', status: 'Open', risk: 'Medium', traffic: 'Heavy', disruption: 30, rainfall: 45 },
];

const statusColors = { Open: '#059669', Risky: '#d97706', Blocked: '#dc2626' };
const severityEmoji = { Critical: '🔴', High: '🟠', Medium: '🟡', Low: '🟢' };

export default function LiveMap({ user }) {
  const [roads, setRoads] = useState(initialRoads);
  const [vehicles, setVehicles] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({ roads: true, vehicles: true, incidents: true, bridges: true, status: 'All' });
  const [notice, setNotice] = useState('');
  const [editingRoad, setEditingRoad] = useState(null);
  const [editStatus, setEditStatus] = useState('Blocked');
  const [editReason, setEditReason] = useState('Severe Landslide');
  const [saving, setSaving] = useState(false);

  // Check if role has road modification authority
  const canModifyRoad = ['admin', 'government_official'].includes(user?.role);

  const fetchLiveMapData = async () => {
    try {
      const [roadsRes, vehiclesRes, incidentsRes] = await Promise.allSettled([
        roadsAPI.getAll(),
        vehiclesAPI.getAll(),
        incidentsAPI.getAll()
      ]);

      if (roadsRes.status === 'fulfilled' && roadsRes.value?.data?.length) {
        const mappedRoads = roadsRes.value.data.map(r => {
          let pts = ROAD_COORDINATES[r.roadId] || [];
          if (!pts.length && r.startPoint?.coordinates && r.endPoint?.coordinates) {
            pts = [
              [r.startPoint.coordinates.lat, r.startPoint.coordinates.lng],
              [r.endPoint.coordinates.lat, r.endPoint.coordinates.lng]
            ];
          }
          return {
            ...r,
            id: r.roadId,
            points: pts,
            risk: r.riskLevel || 'Low',
            traffic: r.trafficLevel || 'Moderate',
            disruption: r.disruptionProbability || 20,
            rainfall: r.rainfall || 40
          };
        }).filter(r => r.points && r.points.length > 0);
        setRoads(mappedRoads);
      }

      if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value?.data?.length) {
        const mappedVehicles = vehiclesRes.value.data.map(v => ({
          ...v,
          id: v.vehicleId,
          lat: v.currentLocation?.lat,
          lng: v.currentLocation?.lng,
          speed: v.currentSpeed,
          fuel: v.fuelLevel,
          priority: v.cargoPriority,
          dest: v.destination?.name
        })).filter(v => v.lat && v.lng);
        setVehicles(mappedVehicles);
      }

      if (incidentsRes.status === 'fulfilled' && incidentsRes.value?.data?.length) {
        setIncidents(incidentsRes.value.data.filter(i => i.status !== 'Resolved'));
      }
    } catch (e) {
      console.warn('LiveMap sync fallback:', e);
    }
  };

  useEffect(() => {
    fetchLiveMapData();
    const interval = setInterval(fetchLiveMapData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
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

  const filteredRoads = roads.filter(r => {
    if (!filters.roads && r.type !== 'Bridge') return false;
    if (!filters.bridges && r.type === 'Bridge') return false;
    if (filters.status !== 'All' && r.status !== filters.status) return false;
    return true;
  });

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
      <div className="filters-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.roads} onChange={e => setFilters({ ...filters, roads: e.target.checked })} /> Highways
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.bridges} onChange={e => setFilters({ ...filters, bridges: e.target.checked })} /> 🌉 Bridges
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.vehicles} onChange={e => setFilters({ ...filters, vehicles: e.target.checked })} /> 🚚 Vehicles ({vehicles.length})
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.incidents} onChange={e => setFilters({ ...filters, incidents: e.target.checked })} /> ⚠️ Incidents ({incidents.length})
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="All">All Road Statuses</option>
            <option value="Open">🟢 Open</option>
            <option value="Risky">🟡 Risky</option>
            <option value="Blocked">🔴 Blocked</option>
          </select>
          {canModifyRoad && (
            <span style={{ fontSize: 12, background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
              ✏️ Road Editing Enabled
            </span>
          )}
        </div>
      </div>

      {/* Full Page Map */}
      <div className="map-container fullpage" style={{ height: 'calc(100vh - 220px)', minHeight: 520, borderRadius: 10, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        <MapContainer center={[25.5, 92.5]} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Roads & Bridges */}
          {filteredRoads.map(road => (
            <Polyline
              key={road.id || road.roadId}
              positions={road.points}
              color={statusColors[road.status] || '#059669'}
              weight={road.type === 'Bridge' ? 8 : road.status === 'Blocked' ? 6 : 5}
              opacity={0.88}
            >
              <Popup>
                <div className="popup-title">
                  {road.type === 'Bridge' ? '🌉 ' : '🛣️ '}{road.name}
                </div>
                <div className="popup-row"><span className="popup-label">Corridor ID:</span><span className="popup-value">{road.roadId || road.id}</span></div>
                <div className="popup-row">
                  <span className="popup-label">Status:</span>
                  <span className="popup-value" style={{ color: statusColors[road.status], fontWeight: 700 }}>
                    {road.status.toUpperCase()}
                  </span>
                </div>
                <div className="popup-row"><span className="popup-label">District / State:</span><span className="popup-value">{road.district}, {road.state}</span></div>
                <div className="popup-row"><span className="popup-label">Risk Level:</span><span className="popup-value">{road.risk}</span></div>
                <div className="popup-row"><span className="popup-label">Disruption:</span><span className="popup-value">{road.disruption}%</span></div>
                {road.type === 'Bridge' && (
                  <div className="popup-row"><span className="popup-label">Bridge Condition:</span><span className="popup-value">{road.bridgeCondition || 'Good'}</span></div>
                )}

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
            <Marker
              key={v.id || v.vehicleId}
              position={[v.lat, v.lng]}
              icon={createIcon(v.status === 'Delayed' ? '🚛' : v.status === 'At Risk' ? '⚠️' : '🚚', 26)}
            >
              <Popup>
                <div className="popup-title" style={{ color: '#0284c7' }}>🚚 {v.id || v.vehicleId}</div>
                <div className="popup-row"><span className="popup-label">Driver:</span><span className="popup-value">{typeof v.driver === 'object' ? v.driver?.name : v.driver}</span></div>
                <div className="popup-row"><span className="popup-label">Cargo:</span><span className="popup-value">{v.cargo}</span></div>
                <div className="popup-row"><span className="popup-label">Priority:</span><span className="popup-value">{v.priority}</span></div>
                <div className="popup-row"><span className="popup-label">Status:</span><span className="popup-value">{v.status}</span></div>
                <div className="popup-row"><span className="popup-label">Speed / Fuel:</span><span className="popup-value">{v.speed} km/h | {v.fuel}%</span></div>
                <div className="popup-row"><span className="popup-label">Destination:</span><span className="popup-value">{v.dest}</span></div>
              </Popup>
            </Marker>
          ))}

          {/* Live Incidents */}
          {filters.incidents && incidents.map(inc => {
            const lat = inc.location?.coordinates?.lat || inc.lat || 25.5;
            const lng = inc.location?.coordinates?.lng || inc.lng || 91.8;
            return (
              <Marker
                key={inc.incidentId || inc.id}
                position={[lat, lng]}
                icon={createIcon(severityEmoji[inc.severity] || '🟡', 24)}
              >
                <Popup>
                  <div className="popup-title" style={{ color: inc.severity === 'Critical' ? '#dc2626' : '#d97706' }}>
                    ⚠️ {inc.incidentId || inc.id} - {inc.type}
                  </div>
                  <div className="popup-row"><span className="popup-label">Severity:</span><span className="popup-value">{inc.severity}</span></div>
                  <div className="popup-row"><span className="popup-label">Location:</span><span className="popup-value">{inc.location?.name || 'Corridor'}</span></div>
                  <div className="popup-row"><span className="popup-label">Status:</span><span className="popup-value">{inc.status}</span></div>
                  <div style={{ fontSize: 12, marginTop: 4, color: '#475569', lineHeight: 1.4 }}>{inc.description || inc.desc}</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div style={{ display: 'flex', gap: 20, padding: '12px 0', fontSize: 12, color: '#475569', flexWrap: 'wrap', alignItems: 'center' }}>
        <span>🚚 Active Vehicle</span>
        <span>🔴 Critical Incident</span>
        <span>🟡 Warning / Road Hazard</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 18, height: 4, background: '#059669', display: 'inline-block' }}></span> 🟢 Open Corridor
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 18, height: 4, background: '#d97706', display: 'inline-block' }}></span> 🟡 Risky Corridor
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 18, height: 4, background: '#dc2626', display: 'inline-block' }}></span> 🔴 Blocked Corridor
        </span>
        <span>🌉 Bridge Infrastructure</span>
      </div>
    </div>
  );
}
