import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (emoji, size = 28) => L.divIcon({
  html: `<div style="font-size:${size}px;text-align:center;line-height:1">${emoji}</div>`,
  className: '',
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});

// Demo markers
const vehicles = [
  { id: 'NER-101', lat: 26.12, lng: 91.85, cargo: 'Medicines', status: 'Moving', driver: 'Rajesh Kumar' },
  { id: 'NER-103', lat: 24.90, lng: 93.88, cargo: 'Emergency', status: 'Moving', driver: 'Tomba Singh' },
  { id: 'NER-105', lat: 27.20, lng: 88.55, cargo: 'Medicines', status: 'At Risk', driver: 'Pempa Sherpa' },
  { id: 'NER-108', lat: 23.80, lng: 92.72, cargo: 'Food', status: 'Delayed', driver: 'Lalthianga' },
];

const incidents = [
  { id: 'INC-0001', lat: 25.65, lng: 91.88, type: 'Landslide', severity: 'Critical' },
  { id: 'INC-0002', lat: 26.63, lng: 92.80, type: 'Flood', severity: 'High' },
  { id: 'INC-0003', lat: 25.70, lng: 94.05, type: 'Road Damage', severity: 'Critical' },
  { id: 'INC-0005', lat: 23.75, lng: 92.73, type: 'Weather Hazard', severity: 'Critical' },
  { id: 'INC-0006', lat: 27.18, lng: 88.53, type: 'Landslide', severity: 'High' },
];

const districts = [
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362, risk: 'Low' },
  { name: 'Shillong', lat: 25.5788, lng: 91.8933, risk: 'Medium' },
  { name: 'Imphal', lat: 24.8170, lng: 93.9368, risk: 'Medium' },
  { name: 'Aizawl', lat: 23.7271, lng: 92.7176, risk: 'High' },
  { name: 'Kohima', lat: 25.6586, lng: 94.1086, risk: 'High' },
  { name: 'Gangtok', lat: 27.3389, lng: 88.6065, risk: 'High' },
  { name: 'Agartala', lat: 23.8315, lng: 91.2868, risk: 'Low' },
  { name: 'Tura', lat: 25.5166, lng: 90.2223, risk: 'High' },
  { name: 'Tezpur', lat: 26.6800, lng: 92.9800, risk: 'Low' },
  { name: 'Dimapur', lat: 25.9065, lng: 93.7272, risk: 'Medium' },
];

const riskColors = { Low: '#059669', Medium: '#d97706', High: '#dc2626', Critical: '#dc2626' };

const roads = [
  { name: 'NH-27 Guwahati-Shillong', points: [[26.1445, 91.7362], [25.88, 91.86], [25.5788, 91.8933]], status: 'Open', color: '#059669' },
  { name: 'NH-2 Imphal-Dimapur', points: [[24.8170, 93.9368], [25.3, 93.82], [25.9065, 93.7272]], status: 'Risky', color: '#d97706' },
  { name: 'NH-6 Aizawl-Silchar', points: [[23.7271, 92.7176], [24.2, 92.75], [24.8333, 92.7789]], status: 'Blocked', color: '#dc2626' },
  { name: 'NH-39 Kohima-Imphal', points: [[25.6586, 94.1086], [25.2, 94.0], [24.8170, 93.9368]], status: 'Blocked', color: '#dc2626' },
  { name: 'NH-10 Gangtok-Siliguri', points: [[27.3389, 88.6065], [27.0, 88.5], [26.7271, 88.3953]], status: 'Risky', color: '#d97706' },
];

export default function DashboardMap() {
  return (
    <div style={{ height: 400, borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer center={[25.5, 92.0]} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Road lines */}
        {roads.map(road => (
          <Polyline key={road.name} positions={road.points} color={road.color} weight={4} opacity={0.8}>
            <Popup><div className="popup-title">{road.name}</div><div>Status: <strong>{road.status}</strong></div></Popup>
          </Polyline>
        ))}

        {/* District markers */}
        {districts.map(d => (
          <CircleMarker key={d.name} center={[d.lat, d.lng]} radius={8} fillColor={riskColors[d.risk]} color="#fff" weight={2} fillOpacity={0.8}>
            <Popup><div className="popup-title">{d.name}</div><div>Risk: <strong>{d.risk}</strong></div></Popup>
          </CircleMarker>
        ))}

        {/* Vehicle markers */}
        {vehicles.map(v => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={createIcon('🚛')}>
            <Popup>
              <div className="popup-title">{v.id}</div>
              <div className="popup-row"><span className="popup-label">Driver:</span><span className="popup-value">{v.driver}</span></div>
              <div className="popup-row"><span className="popup-label">Cargo:</span><span className="popup-value">{v.cargo}</span></div>
              <div className="popup-row"><span className="popup-label">Status:</span><span className="popup-value">{v.status}</span></div>
            </Popup>
          </Marker>
        ))}

        {/* Incident markers */}
        {incidents.map(inc => (
          <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={createIcon(inc.severity === 'Critical' ? '🔴' : '🟡', 20)}>
            <Popup>
              <div className="popup-title">{inc.id} - {inc.type}</div>
              <div>Severity: <strong>{inc.severity}</strong></div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div style={{ display: 'flex', gap: 16, padding: '10px 0', fontSize: 12, color: '#475569', flexWrap: 'wrap' }}>
        <span>🚛 Vehicle</span>
        <span>🔴 Critical Incident</span>
        <span>🟡 Warning</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 20, height: 3, background: '#059669', display: 'inline-block' }}></span> Open Road</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 20, height: 3, background: '#d97706', display: 'inline-block' }}></span> Risky Road</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 20, height: 3, background: '#dc2626', display: 'inline-block' }}></span> Blocked Road</span>
      </div>
    </div>
  );
}
