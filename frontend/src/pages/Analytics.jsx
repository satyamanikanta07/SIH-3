import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import { analyticsAPI, districtsAPI } from '../services/api';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiTruck, FiMapPin, FiRefreshCw } from 'react-icons/fi';

const STATUS_COLORS = {
  Open: '#059669',
  Risky: '#d97706',
  Blocked: '#dc2626',
  'In Transit': '#2563eb',
  Delivered: '#059669',
  Delayed: '#d97706',
  'At Risk': '#dc2626',
  Assigned: '#8b5cf6',
  Pending: '#94a3b8'
};

const defaultRoadStatus = [
  { name: 'Open', value: 12, fill: '#059669' },
  { name: 'Risky', value: 3, fill: '#d97706' },
  { name: 'Blocked', value: 2, fill: '#dc2626' },
];

const defaultIncidents = [
  { name: 'Landslide', count: 4 },
  { name: 'Flood', count: 2 },
  { name: 'Road Damage', count: 3 },
  { name: 'Bridge Damage', count: 1 },
  { name: 'Weather Hazard', count: 2 },
];

const defaultDeliveries = [
  { name: 'In Transit', value: 4, fill: '#2563eb' },
  { name: 'Delayed', value: 2, fill: '#d97706' },
  { name: 'Delivered', value: 3, fill: '#059669' },
  { name: 'At Risk', value: 1, fill: '#dc2626' },
];

export default function Analytics({ user }) {
  const [roadStatusData, setRoadStatusData] = useState(defaultRoadStatus);
  const [incidentTypeData, setIncidentTypeData] = useState(defaultIncidents);
  const [deliveryStatusData, setDeliveryStatusData] = useState(defaultDeliveries);
  const [districtData, setDistrictData] = useState([]);
  const [cargoPerfData, setCargoPerfData] = useState([]);
  const [bottlenecks, setBottlenecks] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      // 1. Overview for roads and totals
      const ovRes = await analyticsAPI.getOverview();
      if (ovRes?.data?.roads) {
        setRoadStatusData([
          { name: 'Open', value: ovRes.data.roads.open || 0, fill: '#059669' },
          { name: 'Risky', value: ovRes.data.roads.risky || 0, fill: '#d97706' },
          { name: 'Blocked', value: ovRes.data.roads.blocked || 0, fill: '#dc2626' },
        ]);
      }

      // 2. Incidents by type
      try {
        const incRes = await analyticsAPI.getIncidentsByType();
        if (incRes?.data?.length) {
          setIncidentTypeData(incRes.data.map(i => ({ name: i._id || 'Other', count: i.count })));
        }
      } catch (e) {}

      // 3. Deliveries by status
      try {
        const delRes = await analyticsAPI.getDeliveriesByStatus();
        if (delRes?.data?.length) {
          setDeliveryStatusData(delRes.data.map(d => ({
            name: d._id || 'Other',
            value: d.count,
            fill: STATUS_COLORS[d._id] || '#64748b'
          })));
        }
      } catch (e) {}

      // 4. District Accessibility
      try {
        const distRes = await districtsAPI.getAll();
        if (distRes?.data?.length) {
          setDistrictData(distRes.data.map(d => ({
            name: d.name,
            accessibility: d.accessibilityScore || 70,
            blocked: d.roadStats?.blocked || 0,
            activeIncidents: d.activeIncidents || 0
          })));
        }
      } catch (e) {}

      // 5. Bottlenecks intelligence
      try {
        const bRes = await analyticsAPI.getBottlenecks();
        if (bRes?.data) {
          setBottlenecks(bRes.data);
          if (bRes.data.cargoPerformance?.length) {
            setCargoPerfData(bRes.data.cargoPerformance);
          }
        }
      } catch (e) {}

    } catch (err) {
      console.warn('Analytics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const timer = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Analytics & Intelligence Dashboard</h2>
          <p>Real-time cross-agency intelligence, bottleneck detection, and infrastructure metrics</p>
        </div>
        <button className="btn btn-outline" style={{ padding: '6px 14px' }} onClick={fetchAnalytics}>
          <FiRefreshCw /> Refresh Data
        </button>
      </div>

      {/* Bottlenecks Alert Strip */}
      {bottlenecks && bottlenecks.mostDisruptedRoads?.length > 0 && (
        <div className="card" style={{ marginBottom: 20, background: '#fef2f2', border: '1px solid #fecaca' }}>
          <h3 style={{ color: '#b91c1c', fontSize: 14, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiAlertTriangle /> Critical Infrastructure Bottlenecks Detected
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {bottlenecks.mostDisruptedRoads.slice(0, 4).map(r => (
              <div key={r.roadId} style={{ background: '#fff', padding: '10px 12px', borderRadius: 6, border: '1px solid #fca5a5' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{r.district} • {r.type}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
                  <span className={`badge-status ${r.status?.toLowerCase()}`}>{r.status}</span>
                  <span style={{ color: '#b91c1c', fontWeight: 600 }}>Risk: {r.disruptionProbability || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Road Status + Incidents by Type */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>📊 Road Accessibility Distribution</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={roadStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {roadStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>⚠️ Active Incidents by Hazard Type</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={incidentTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Delivery Status + District Connectivity */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>📦 Consignment Delivery Statuses</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deliveryStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {deliveryStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>🏘️ District Accessibility Scores</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={districtData.length ? districtData : [{ name: 'Imphal', accessibility: 65 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="accessibility" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {districtData.map((entry, i) => (
                    <Cell key={i} fill={entry.accessibility >= 75 ? '#059669' : entry.accessibility >= 60 ? '#d97706' : '#dc2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Cargo Performance & Delay Breakdown */}
      {cargoPerfData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>🚛 Cargo Performance & Average Delay by Commodity</h3></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cargoPerfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgDelay" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Delay (min)" />
                <Bar dataKey="trips" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Shipments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
