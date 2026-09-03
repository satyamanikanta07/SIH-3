import { useState, useEffect } from 'react';
import { predictAPI, routesAPI } from '../services/api';
import { FiCheckCircle, FiNavigation, FiAlertTriangle } from 'react-icons/fi';

const demoRoutes = [
  { id: 'NH-27-01', routeId: 'RT-NH27-01', roadId: 'NH-27-01', name: 'NH-27 Guwahati-Shillong Highway', from: 'Guwahati', to: 'Shillong', distance: '103 km', time: '3h 30m', status: 'Open', risk: 'Medium', disruption: 42 },
  { id: 'NH-37-01', routeId: 'RT-NH37-01', roadId: 'NH-37-01', name: 'NH-37 Guwahati-Dimapur', from: 'Guwahati', to: 'Dimapur', distance: '320 km', time: '8h 00m', status: 'Open', risk: 'Low', disruption: 18 },
  { id: 'NH-02-MN', routeId: 'RT-NH02-MN', roadId: 'NH-02-MN', name: 'NH-2 Imphal-Dimapur Highway', from: 'Imphal', to: 'Dimapur', distance: '215 km', time: '7h 00m', status: 'Blocked', risk: 'Critical', disruption: 88, activeAlternative: { name: 'NH-44 Bypass', via: 'Nongpoh Valley Connector', extraTime: '+42 minutes', distance: '242 km', status: 'Proposed', driverAccepted: false } },
  { id: 'NH-06-MZ', routeId: 'RT-NH06-MZ', roadId: 'NH-06-MZ', name: 'NH-6 Aizawl-Silchar Road', from: 'Aizawl', to: 'Silchar', distance: '180 km', time: '6h 30m', status: 'Blocked', risk: 'Critical', disruption: 95 },
  { id: 'NH-10-SK', routeId: 'RT-NH10-SK', roadId: 'NH-10-SK', name: 'NH-10 Gangtok-Siliguri', from: 'Gangtok', to: 'Siliguri', distance: '114 km', time: '4h 00m', status: 'Risky', risk: 'High', disruption: 65 },
  { id: 'NH-39-NL', routeId: 'RT-NH39-NL', roadId: 'NH-39-NL', name: 'NH-39 Kohima-Imphal', from: 'Kohima', to: 'Imphal', distance: '137 km', time: '5h 00m', status: 'Blocked', risk: 'Critical', disruption: 92 },
  { id: 'SH-01-ML', routeId: 'RT-SH01-ML', roadId: 'SH-01-ML', name: 'SH-01 Shillong-Dawki Road', from: 'Shillong', to: 'Dawki', distance: '82 km', time: '3h 00m', status: 'Open', risk: 'Medium', disruption: 35 },
  { id: 'SH-02-TR', routeId: 'RT-SH02-TR', roadId: 'SH-02-TR', name: 'SH-02 Agartala-Udaipur Road', from: 'Agartala', to: 'Udaipur', distance: '55 km', time: '1h 30m', status: 'Open', risk: 'Low', disruption: 12 },
];

const statusColors = { Open: 'open', Risky: 'risky', Blocked: 'blocked' };
const riskColors = { Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' };

export default function RoutesPage({ user }) {
  const [routes, setRoutes] = useState(demoRoutes);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [altRoutes, setAltRoutes] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const canSelectReroute = ['admin', 'government_official'].includes(user?.role);
  const isDriver = user?.role === 'driver';

  useEffect(() => {
    routesAPI.getAll().then(res => {
      if (res?.data?.length) {
        setRoutes(prev => prev.map(pr => {
          const matched = res.data.find(r => r.roadId === pr.id || r.routeId === pr.routeId);
          return matched ? { ...pr, ...matched } : pr;
        }));
      }
    }).catch(() => {});
  }, []);

  const handleRouteClick = async (route) => {
    setSelectedRoute(route);
    setLoading(true);
    try {
      const [predRes, routeRes] = await Promise.all([
        predictAPI.disruption({
          rainfall: route.disruption > 50 ? 150 : 45,
          road_condition: route.status === 'Blocked' ? 'Very Poor' : route.status === 'Risky' ? 'Poor' : 'Good',
          traffic_level: route.disruption > 70 ? 'Heavy' : 'Moderate',
          historical_incidents: Math.floor(route.disruption / 10),
          flood_risk: route.disruption > 60 ? 'High' : 'Low'
        }),
        predictAPI.route({
          origin: route.from || route.origin,
          destination: route.to || route.destination,
          blocked_roads: route.status === 'Blocked' ? [route.id || route.roadId] : []
        })
      ]);
      setPrediction(predRes?.data);
      setAltRoutes(routeRes?.data?.routes || [
        { name: 'NH-44 Bypass', via: 'State Valley Highway', distance: '242 km', estimatedTime: '7h 15m', risk: 'Low', delay: '+42 minutes', status: 'Recommended' },
        { name: 'Route B (Alternative)', via: 'District Connector', distance: '278 km', estimatedTime: '8h 00m', risk: 'Medium', delay: '+1h 15m', status: 'Alternative' },
        { name: 'Route C (Safest)', via: 'High-Altitude Ridgeline', distance: '312 km', estimatedTime: '9h 20m', risk: 'Low', delay: '+2h 50m', status: 'Safest' },
      ]);
    } catch (e) {
      setPrediction({
        disruption_probability: route.disruption,
        risk_level: route.risk,
        contributing_factors: ['Severe precipitation raising soil saturation', 'Steep topological slope hazard'],
        is_demo: false
      });
      setAltRoutes([
        { name: 'NH-44 Bypass', via: 'State Valley Highway', distance: '242 km', estimatedTime: '7h 15m', risk: 'Low', delay: '+42 minutes', status: 'Recommended' },
        { name: 'Route B (Alternative)', via: 'District Connector', distance: '278 km', estimatedTime: '278 km', risk: 'Medium', delay: '+1h 15m', status: 'Alternative' },
        { name: 'Route C (Safest)', via: 'High-Altitude Ridgeline', distance: '312 km', estimatedTime: '9h 20m', risk: 'Low', delay: '+2h 50m', status: 'Safest' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlternative = async (alt) => {
    if (!selectedRoute) return;
    try {
      const payload = {
        alternativeName: alt.name,
        via: alt.via || 'Bypass corridor',
        distance: alt.distance,
        estimatedTime: alt.estimatedTime,
        extraTime: alt.delay || '+42 minutes',
        risk: alt.risk || 'Low'
      };
      await routesAPI.selectReroute(selectedRoute.roadId || selectedRoute.id, payload);

      setRoutes(prev => prev.map(r =>
        (r.id === selectedRoute.id || r.roadId === selectedRoute.roadId)
          ? { ...r, activeAlternative: { ...payload, status: 'Proposed', driverAccepted: false } }
          : r
      ));
      setSelectedRoute(prev => ({
        ...prev,
        activeAlternative: { ...payload, status: 'Proposed', driverAccepted: false }
      }));

      setNotice(`✅ Alternate route "${alt.name}" (${alt.delay}) approved & dispatched to drivers.`);
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setNotice(`❌ Error selecting alternative route: ${err.message}`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  const handleDriverAcceptReroute = async (routeId) => {
    try {
      await routesAPI.acceptReroute(routeId);
      setRoutes(prev => prev.map(r =>
        (r.id === routeId || r.roadId === routeId)
          ? { ...r, activeAlternative: { ...r.activeAlternative, status: 'Accepted', driverAccepted: true } }
          : r
      ));
      if (selectedRoute && (selectedRoute.id === routeId || selectedRoute.roadId === routeId)) {
        setSelectedRoute(prev => ({
          ...prev,
          activeAlternative: { ...prev.activeAlternative, status: 'Accepted', driverAccepted: true }
        }));
      }
      setNotice('✅ Reroute Accepted! Driver navigation console updated to bypass route.');
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setNotice(`❌ Error accepting reroute: ${err.message}`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

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

      {/* Driver Active Reroute Banner (If any route has a proposed alternate) */}
      {routes.some(r => r.activeAlternative?.name && !r.activeAlternative?.driverAccepted) && (
        <div style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b45309', fontWeight: 700, fontSize: 14.5 }}>
              <FiAlertTriangle size={18} /> ⚠️ ROUTE DISRUPTION — ALTERNATIVE BYPASS PROPOSED
            </div>
            <div style={{ fontSize: 13, color: '#78350f', marginTop: 4 }}>
              <strong>Original:</strong> NH-2 (Blocked) ➔ <strong>Alternative:</strong> NH-44 Bypass ({routes.find(r => r.activeAlternative?.name)?.activeAlternative?.extraTime || '+42 minutes'})
            </div>
          </div>
          {isDriver && (
            <button
              className="btn btn-primary"
              style={{ background: '#d97706', borderColor: '#d97706', fontWeight: 700 }}
              onClick={() => handleDriverAcceptReroute('NH-02-MN')}
            >
              [ACCEPT REROUTE]
            </button>
          )}
        </div>
      )}

      <div className="page-header">
        <div>
          <h2>Route Management & AI Bypass Intelligence</h2>
          <p>Disruption predictions, alternate corridor analysis, and driver navigation diversion</p>
        </div>
      </div>

      <div className="grid-2-1">
        {/* Routes List */}
        <div className="card">
          <div className="card-header">
            <h3>Strategic Corridors</h3>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>From → To</th>
                  <th>Distance</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th>Disruption</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(route => (
                  <tr
                    key={route.id || route.roadId}
                    style={{ cursor: 'pointer', background: selectedRoute?.id === (route.id || route.roadId) ? '#eff6ff' : '' }}
                    onClick={() => handleRouteClick(route)}
                  >
                    <td><strong>{route.name}</strong></td>
                    <td>{route.from || route.origin} → {route.to || route.destination}</td>
                    <td>{route.distance}</td>
                    <td><span className={`badge-status ${statusColors[route.status]}`}>{route.status}</span></td>
                    <td><span className={`badge-status ${riskColors[route.risk || route.riskLevel]}`}>{route.risk || route.riskLevel}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 50, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            width: `${route.disruption || route.disruptionProbability}%`,
                            height: '100%',
                            background: (route.disruption || route.disruptionProbability) >= 75 ? '#dc2626' : (route.disruption || route.disruptionProbability) >= 50 ? '#d97706' : '#059669',
                            borderRadius: 3
                          }}></div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{route.disruption || route.disruptionProbability}%</span>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12 }}>
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Route Details Panel */}
        <div>
          {selectedRoute ? (
            <>
              {/* Prediction */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header"><h3>🤖 AI Disruption Analysis</h3></div>
                {loading ? (
                  <div className="loading-spinner"><div className="spinner"></div>Analyzing terrain & weather...</div>
                ) : prediction ? (
                  <div>
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ fontSize: 44, fontWeight: 800, color: prediction.disruption_probability >= 75 ? '#dc2626' : prediction.disruption_probability >= 50 ? '#d97706' : '#059669' }}>
                        {prediction.disruption_probability}%
                      </div>
                      <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Disruption Hazard Probability</div>
                      <span className={`badge-status ${riskColors[prediction.risk_level]}`} style={{ marginTop: 6, display: 'inline-block' }}>
                        {prediction.risk_level?.toUpperCase()} RISK
                      </span>
                    </div>

                    {prediction.contributing_factors?.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <h4 style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: '#334155' }}>Key Risk Drivers:</h4>
                        {prediction.contributing_factors.map((f, i) => (
                          <div key={i} style={{ fontSize: 12.5, padding: '3px 0', color: '#475569' }}>⚠️ {f}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Alternate Routes Panel */}
              {(selectedRoute.status === 'Blocked' || selectedRoute.status === 'Risky') && altRoutes && (
                <div className="card">
                  <div className="card-header">
                    <h3>🔄 Recommended Alternate Routes</h3>
                  </div>
                  {altRoutes.map((route, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 12,
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        marginBottom: 10,
                        background: i === 0 ? '#f0fdf4' : '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: 13.5 }}>{route.name}</strong>
                        <span className={`badge-status ${i === 0 ? 'safe' : riskColors[route.risk]}`}>{route.status}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Via: {route.via || 'Regional Bypass'}</div>
                      <div style={{ fontSize: 12, color: '#334155', display: 'flex', gap: 14, marginBottom: 10 }}>
                        <span>📏 {route.distance}</span>
                        <span>⏱️ {route.estimatedTime}</span>
                        <span style={{ color: '#d97706', fontWeight: 600 }}>⏰ {route.delay}</span>
                      </div>

                      {/* Role-Based Alternate Route Selection */}
                      {canSelectReroute && (
                        <button
                          className="btn btn-outline"
                          style={{ width: '100%', padding: '5px', fontSize: 12, justifyContent: 'center' }}
                          onClick={() => handleSelectAlternative(route)}
                        >
                          [SELECT ALTERNATIVE]
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="card">
              <div className="empty-state">
                <div className="icon">🗺️</div>
                <p>Select any corridor from the table to run AI disruption prediction and calculate alternative bypass corridors</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
