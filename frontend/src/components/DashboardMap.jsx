import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { roadsAPI, vehiclesAPI, incidentsAPI, districtsAPI } from '../services/api';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (emoji, size = 26) => L.divIcon({
  html: `<div style="font-size:${size}px;text-align:center;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${emoji}</div>`,
  className: '',
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});

// Known polyline coordinates for key NER corridors
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
  'BR-01-KAM': [[26.2000, 91.7200], [26.1700, 91.7300]],
  'DR-02-DIM': [[25.9065, 93.7272], [25.75, 93.9], [25.6586, 94.1086]],
};

const initialRoads = [
  { roadId: 'NH-27-01', name: 'NH-27 Guwahati-Shillong', status: 'Open', points: ROAD_COORDINATES['NH-27-01'] },
  { roadId: 'NH-02-MN', name: 'NH-2 Imphal-Dimapur', status: 'Risky', points: ROAD_COORDINATES['NH-02-MN'] },
  { roadId: 'NH-06-MZ', name: 'NH-6 Aizawl-Silchar', status: 'Blocked', points: ROAD_COORDINATES['NH-06-MZ'] },
  { roadId: 'NH-39-NL', name: 'NH-39 Kohima-Imphal', status: 'Blocked', points: ROAD_COORDINATES['NH-39-NL'] },
  { roadId: 'NH-10-SK', name: 'NH-10 Gangtok-Siliguri', status: 'Risky', points: ROAD_COORDINATES['NH-10-SK'] },
];

const riskColors = { Low: '#059669', Medium: '#d97706', High: '#dc2626', Critical: '#dc2626' };

export default function DashboardMap() {
  const [roads, setRoads] = useState(initialRoads);
  const [vehicles, setVehicles] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [districts, setDistricts] = useState([]);

  const loadMapData = async () => {
    try {
      const [roadsRes, vehiclesRes, incidentsRes, districtsRes] = await Promise.allSettled([
        roadsAPI.getAll(),
        vehiclesAPI.getAll(),
        incidentsAPI.getAll(),
        districtsAPI.getAll()
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
            points: pts
          };
        }).filter(r => r.points && r.points.length > 0);
        setRoads(mappedRoads);
      }

      if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value?.data?.length) {
        setVehicles(vehiclesRes.value.data);
      }

      if (incidentsRes.status === 'fulfilled' && incidentsRes.value?.data?.length) {
        setIncidents(incidentsRes.value.data.filter(i => i.status !== 'Resolved'));
      }

      if (districtsRes.status === 'fulfilled' && districtsRes.value?.data?.length) {
        setDistricts(districtsRes.value.data);
      }
    } catch (e) {
      console.warn('DashboardMap dynamic sync fallback:', e);
    }
  };

  useEffect(() => {
    loadMapData();
    const interval = setInterval(loadMapData, 10000); // Live 10s sync
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status === 'Blocked') return '#dc2626';
    if (status === 'Risky') return '#d97706';
    return '#059669';
  };

  return (
    <div style={{ height: 400, borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer center={[25.5, 92.5]} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Road Polylines */}
        {roads.map(road => (
          <Polyline
            key={road.roadId || road.name}
            positions={road.points}
            color={getStatusColor(road.status)}
            weight={road.status === 'Blocked' ? 5 : 4}
            opacity={0.85}
          >
            <Popup>
              <div style={{ padding: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{road.name}</div>
                <div>Status: <strong style={{ color: getStatusColor(road.status) }}>{road.status?.toUpperCase()}</strong></div>
                <div>District: <strong>{road.district || 'NER Corridor'}</strong></div>
                <div>Type: <strong>{road.type === 'Bridge' ? '🌉 Bridge' : 'Highway'}</strong></div>
                {road.status === 'Blocked' && (
                  <div style={{ color: '#dc2626', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                    ⛔ Immediate diversion active.
                  </div>
                )}
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Dynamic District Centers */}
        {districts.map(d => {
          if (!d.center?.lat || !d.center?.lng) return null;
          return (
            <CircleMarker
              key={d.name}
              center={[d.center.lat, d.center.lng]}
              radius={8}
              fillColor={riskColors[d.riskLevel] || '#3b82f6'}
              color="#fff"
              weight={2}
              fillOpacity={0.85}
            >
              <Popup>
                <div style={{ padding: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{d.name} ({d.state})</div>
                  <div>Accessibility: <strong>{d.accessibilityScore || 75}%</strong></div>
                  <div>Risk: <strong>{d.riskLevel}</strong></div>
                  <div>Open: {d.openRoads ?? '-'} | Blocked: {d.blockedRoads ?? '-'}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Dynamic Live Vehicles */}
        {vehicles.map(v => {
          if (!v.currentLocation?.lat || !v.currentLocation?.lng) return null;
          return (
            <Marker
              key={v.vehicleId}
              position={[v.currentLocation.lat, v.currentLocation.lng]}
              icon={createIcon('🚚', 24)}
            >
              <Popup>
                <div style={{ padding: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0284c7' }}>🚚 {v.vehicleId}</div>
                  <div>Driver: <strong>{v.driver?.name || 'Assigned Driver'}</strong></div>
                  <div>Cargo: <strong>{v.cargo} ({v.cargoPriority})</strong></div>
                  <div>Speed: <strong>{v.currentSpeed || 0} km/h</strong> | Fuel: <strong>{v.fuelLevel || 75}%</strong></div>
                  <div>Status: <strong>{v.status}</strong></div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Dynamic Ground Incidents */}
        {incidents.map(inc => {
          if (!inc.location?.coordinates?.lat || !inc.location?.coordinates?.lng) return null;
          return (
            <Marker
              key={inc.incidentId}
              position={[inc.location.coordinates.lat, inc.location.coordinates.lng]}
              icon={createIcon(inc.severity === 'Critical' ? '🔴' : '🟡', 22)}
            >
              <Popup>
                <div style={{ padding: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: inc.severity === 'Critical' ? '#dc2626' : '#d97706' }}>
                    ⚠️ {inc.incidentId} — {inc.type}
                  </div>
                  <div>Location: <strong>{inc.location?.name}</strong></div>
                  <div>Severity: <strong>{inc.severity}</strong></div>
                  <div>Status: <strong>{inc.status}</strong></div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{inc.description}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Comprehensive Legend (Requirement 23) */}
      <div style={{
        display: 'flex',
        gap: 14,
        padding: '8px 12px',
        fontSize: 11.5,
        color: '#475569',
        flexWrap: 'wrap',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        alignItems: 'center'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 3, background: '#059669', display: 'inline-block' }}></span> 🟢 Open
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 3, background: '#d97706', display: 'inline-block' }}></span> 🟡 Risky
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 3, background: '#dc2626', display: 'inline-block' }}></span> 🔴 Blocked
        </span>
        <span>🚚 Live Vehicle</span>
        <span>⚠️ Incident</span>
        <span>🌉 Bridge</span>
      </div>
    </div>
  );
}
