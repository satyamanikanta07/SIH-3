import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiCheckCircle, FiAlertTriangle, FiXCircle, FiTruck, FiClock, FiBell, FiAlertOctagon, FiActivity, FiArrowRight } from 'react-icons/fi';
import { analyticsAPI, alertsAPI, deliveriesAPI, roadsAPI, vehiclesAPI } from '../services/api';
import DashboardMap from '../components/DashboardMap';

// Demo data fallback
const demoStats = {
  roads: { total: 2431, open: 2120, risky: 187, blocked: 124 },
  vehicles: { total: 542, moving: 389, delayed: 32 },
  incidents: { total: 48, active: 17 },
  deliveries: { total: 156, delayed: 32, inTransit: 87 },
  criticalAlerts: 17
};

const demoAlerts = [
  { alertId: 'ALT-0001', severity: 'Critical', title: 'NH-6 Aizawl-Silchar Road Blocked', message: 'Road completely blocked due to landslide. 3 vehicles stranded.', createdAt: new Date(Date.now() - 1800000) },
  { alertId: 'ALT-0003', severity: 'Warning', title: 'Heavy Rainfall Alert - Meghalaya', message: 'Heavy to very heavy rainfall (150-200mm) expected in East Khasi Hills.', createdAt: new Date(Date.now() - 3600000) },
  { alertId: 'ALT-0005', severity: 'Warning', title: 'Medicine Delivery NER-105 At Risk', message: 'Critical medicine delivery delayed due to landslide on NH-10.', createdAt: new Date(Date.now() - 7200000) },
  { alertId: 'ALT-0006', severity: 'Critical', title: 'Food Supply to Aizawl Critically Delayed', message: 'Essential food delivery delayed by 6 hours. Road blocked on NH-6.', createdAt: new Date(Date.now() - 10800000) },
];

const demoDeliveries = [
  { deliveryId: 'DEL-0001', cargo: 'Medicines', destination: { name: 'Shillong Civil Hospital' }, priority: 'Critical', status: 'In Transit', delay: 45, vehicleId: 'NER-101' },
  { deliveryId: 'DEL-0005', cargo: 'Medicines', destination: { name: 'Gangtok Health Center' }, priority: 'Critical', status: 'At Risk', delay: 90, vehicleId: 'NER-105' },
  { deliveryId: 'DEL-0008', cargo: 'Food', destination: { name: 'Aizawl Central Warehouse' }, priority: 'Critical', status: 'Delayed', delay: 360, vehicleId: 'NER-108' },
  { deliveryId: 'DEL-0003', cargo: 'Emergency', destination: { name: 'Churachandpur Hospital' }, priority: 'Critical', status: 'In Transit', delay: 0, vehicleId: 'NER-103' },
];

const demoInsights = [
  { icon: '🌧️', text: 'Heavy rainfall is increasing disruption risk on 4 major corridors in Meghalaya and Mizoram.' },
  { icon: '🚛', text: '12 vehicles may experience delays due to current road conditions on NH-2 and NH-39.' },
  { icon: '💊', text: 'Medicine delivery NER-105 should be redirected through alternate route via Rangpo bypass.' },
  { icon: '⚠️', text: 'Kohima district may become difficult to access if rainfall continues for next 24 hours.' },
  { icon: '🌊', text: 'Brahmaputra water level at Tezpur is above danger mark. Flood risk increasing for Sonitpur district.' },
];

function timeAgo(date) {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(demoStats);
  const [alerts, setAlerts] = useState(demoAlerts);
  const [criticalDeliveries, setCriticalDeliveries] = useState(demoDeliveries);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, alertsRes, deliveriesRes] = await Promise.all([
          analyticsAPI.getOverview(),
          alertsAPI.getAll({ severity: 'Critical' }),
          deliveriesAPI.getAll({ priority: 'Critical' })
        ]);
        if (overviewRes?.data) setStats(overviewRes.data);
        if (alertsRes?.data) setAlerts(alertsRes.data.slice(0, 5));
        if (deliveriesRes?.data) setCriticalDeliveries(deliveriesRes.data.filter(d => d.status !== 'Delivered').slice(0, 5));
      } catch (e) {
        // Use demo data on error
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Roads Monitored', value: stats.roads.total.toLocaleString(), icon: FiMapPin, color: 'blue' },
    { label: 'Open Roads', value: stats.roads.open.toLocaleString(), icon: FiCheckCircle, color: 'green' },
    { label: 'Risky Roads', value: stats.roads.risky.toLocaleString(), icon: FiAlertTriangle, color: 'yellow' },
    { label: 'Blocked Roads', value: stats.roads.blocked.toLocaleString(), icon: FiXCircle, color: 'red' },
    { label: 'Active Vehicles', value: stats.vehicles.total.toLocaleString(), icon: FiTruck, color: 'blue' },
    { label: 'Delayed Deliveries', value: stats.deliveries.delayed.toLocaleString(), icon: FiClock, color: 'yellow' },
    { label: 'Critical Alerts', value: String(stats.criticalAlerts), icon: FiBell, color: 'red' },
    { label: 'Active Incidents', value: stats.incidents.active.toLocaleString(), icon: FiAlertOctagon, color: 'red' },
  ];

  return (
    <div>
      {/* Stat Cards */}
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

      {/* Map + AI Insights */}
      <div className="grid-2-1" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>🗺️ Regional Overview</h3>
            <Link to="/map" className="card-action">Full Map →</Link>
          </div>
          <DashboardMap />
        </div>

        <div className="card">
          <div className="card-header">
            <h3>🤖 AI Intelligence Insights</h3>
            <span className="badge-status info" style={{ fontSize: 11 }}>Live</span>
          </div>
          {demoInsights.map((insight, i) => (
            <div className="insight-card" key={i}>
              <span className="insight-icon">{insight.icon}</span>
              <p>{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts + Critical Deliveries */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>🚨 Recent Alerts</h3>
            <Link to="/alerts" className="card-action">View All →</Link>
          </div>
          {alerts.map(alert => (
            <div className={`alert-item ${alert.severity?.toLowerCase()}`} key={alert.alertId}>
              <span className="alert-icon">
                {alert.severity === 'Critical' ? '🔴' : alert.severity === 'Warning' ? '🟡' : 'ℹ️'}
              </span>
              <div className="alert-content">
                <h4>{alert.title}</h4>
                <p>{alert.message}</p>
              </div>
              <span className="alert-time">{timeAgo(alert.createdAt)}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>🚑 Critical Deliveries</h3>
            <Link to="/logistics" className="card-action">View All →</Link>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Delivery</th>
                  <th>Cargo</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Delay</th>
                </tr>
              </thead>
              <tbody>
                {criticalDeliveries.map(del => (
                  <tr key={del.deliveryId}>
                    <td><strong>{del.deliveryId}</strong></td>
                    <td>{del.cargo}</td>
                    <td>{del.destination?.name}</td>
                    <td>
                      <span className={`badge-status ${del.status?.toLowerCase().replace(' ', '-')}`}>
                        {del.status}
                      </span>
                    </td>
                    <td style={{ color: del.delay > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>
                      {del.delay > 0 ? `+${del.delay}m` : 'On Time'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
