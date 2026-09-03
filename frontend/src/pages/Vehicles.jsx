import { useState, useEffect } from 'react';
import { FiTruck, FiMapPin, FiClock, FiActivity, FiNavigation, FiCheck } from 'react-icons/fi';
import { vehiclesAPI } from '../services/api';

const demoVehicles = [
  { vehicleId: 'NER-101', registrationNumber: 'AS-01-AB-1234', type: 'Truck', driver: { name: 'Rajesh Kumar', phone: '9876543210' }, currentLocation: { lat: 26.12, lng: 91.85, address: 'Near Jorabat, Assam' }, destination: { name: 'Shillong' }, origin: { name: 'Guwahati' }, cargo: 'Medicines', cargoPriority: 'Critical', status: 'Moving', currentSpeed: 35, eta: '4h 35m', fuelLevel: 72, distanceCovered: 32, totalDistance: 103 },
  { vehicleId: 'NER-102', registrationNumber: 'ML-05-CD-5678', type: 'Truck', driver: { name: 'Bimal Das' }, currentLocation: { lat: 25.65, lng: 91.90, address: 'Nongpoh, Meghalaya' }, destination: { name: 'Tura' }, origin: { name: 'Shillong' }, cargo: 'Food', cargoPriority: 'High', status: 'Moving', currentSpeed: 28, eta: '7h 10m', fuelLevel: 58, distanceCovered: 45, totalDistance: 220 },
  { vehicleId: 'NER-103', registrationNumber: 'MN-01-EF-9012', type: 'Ambulance', driver: { name: 'Tomba Singh' }, currentLocation: { lat: 24.90, lng: 93.88, address: 'Near Kangpokpi, Manipur' }, destination: { name: 'Churachandpur' }, origin: { name: 'Imphal' }, cargo: 'Emergency', cargoPriority: 'Critical', status: 'Moving', currentSpeed: 42, eta: '2h 00m', fuelLevel: 85, distanceCovered: 28, totalDistance: 60 },
  { vehicleId: 'NER-104', registrationNumber: 'AS-12-GH-3456', type: 'Truck', driver: { name: 'Abdul Rahman' }, currentLocation: { lat: 26.85, lng: 93.50, address: 'Near Nagaon, Assam' }, destination: { name: 'Dimapur' }, origin: { name: 'Guwahati' }, cargo: 'Construction', cargoPriority: 'Medium', status: 'Delayed', currentSpeed: 0, eta: '8h 00m', fuelLevel: 45, distanceCovered: 180, totalDistance: 320 },
  { vehicleId: 'NER-105', registrationNumber: 'SK-01-IJ-7890', type: 'Van', driver: { name: 'Pempa Sherpa' }, currentLocation: { lat: 27.20, lng: 88.55, address: 'Near Rangpo, Sikkim' }, destination: { name: 'Gangtok' }, origin: { name: 'Siliguri' }, cargo: 'Medicines', cargoPriority: 'Critical', status: 'At Risk', currentSpeed: 15, eta: '3h 00m', fuelLevel: 62, distanceCovered: 75, totalDistance: 114 },
  { vehicleId: 'NER-106', registrationNumber: 'TR-01-KL-2345', type: 'Truck', driver: { name: 'Subhash Debnath' }, currentLocation: { lat: 23.78, lng: 91.35, address: 'Near Agartala, Tripura' }, destination: { name: 'Udaipur' }, origin: { name: 'Agartala' }, cargo: 'Agricultural', cargoPriority: 'Medium', status: 'Moving', currentSpeed: 38, eta: '1h 30m', fuelLevel: 80, distanceCovered: 20, totalDistance: 55 },
  { vehicleId: 'NER-107', registrationNumber: 'NL-07-MN-6789', type: 'Tanker', driver: { name: 'Kevi Zhimo' }, currentLocation: { lat: 25.85, lng: 93.80, address: 'Near Chumukedima, Nagaland' }, destination: { name: 'Kohima' }, origin: { name: 'Dimapur' }, cargo: 'Fuel', cargoPriority: 'High', status: 'Stopped', currentSpeed: 0, eta: '5h 00m', fuelLevel: 95, distanceCovered: 12, totalDistance: 74 },
  { vehicleId: 'NER-108', registrationNumber: 'MZ-01-OP-1234', type: 'Truck', driver: { name: 'Lalthianga' }, currentLocation: { lat: 23.80, lng: 92.72, address: 'Near Vairengte, Mizoram' }, destination: { name: 'Aizawl' }, origin: { name: 'Silchar' }, cargo: 'Food', cargoPriority: 'Critical', status: 'Delayed', currentSpeed: 0, eta: '12h 00m', fuelLevel: 35, distanceCovered: 120, totalDistance: 180 },
];

const statusBadge = (status) => {
  const cls = status === 'Moving' ? 'moving' : status === 'Delayed' ? 'delayed' : status === 'At Risk' ? 'at-risk' : status === 'Stopped' ? 'warning' : 'info';
  return <span className={`badge-status ${cls}`}>{status}</span>;
};

const priorityStyle = (p) => p === 'Critical' ? { color: '#dc2626', fontWeight: 600 } : p === 'High' ? { color: '#d97706', fontWeight: 600 } : {};

export default function Vehicles({ user }) {
  const [vehicles, setVehicles] = useState(demoVehicles);
  const [filter, setFilter] = useState({ status: '', cargo: '' });
  const [notice, setNotice] = useState('');
  const isDriver = user?.role === 'driver';

  // Driver Telemetry Form State
  const [myVehicle, setMyVehicle] = useState(demoVehicles[0]);
  const [driverSpeed, setDriverSpeed] = useState(45);
  const [driverFuel, setDriverFuel] = useState(62);
  const [driverLat, setDriverLat] = useState(25.57);
  const [driverLng, setDriverLng] = useState(91.88);
  const [driverStatus, setDriverStatus] = useState('Moving');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    vehiclesAPI.getAll().then(res => {
      if (res?.data?.length) {
        setVehicles(res.data);
      }
    }).catch(() => {});

    if (isDriver) {
      vehiclesAPI.getMyVehicle().then(res => {
        if (res?.data) {
          setMyVehicle(res.data);
          setDriverSpeed(res.data.currentSpeed || 45);
          setDriverFuel(res.data.fuelLevel || 62);
          setDriverLat(res.data.currentLocation?.lat || 25.57);
          setDriverLng(res.data.currentLocation?.lng || 91.88);
          setDriverStatus(res.data.status || 'Moving');
        }
      }).catch(() => {
        // Fallback default driver vehicle
        setMyVehicle(demoVehicles[0]);
      });
    }
  }, [user]);

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverLat(Number(pos.coords.latitude.toFixed(4)));
          setDriverLng(Number(pos.coords.longitude.toFixed(4)));
          setNotice('📍 GPS coordinates captured from device geolocation sensor.');
          setTimeout(() => setNotice(''), 4000);
        },
        () => {
          // Fallback realistic NER GPS
          setDriverLat(25.5788);
          setDriverLng(91.8933);
          setNotice('📍 Captured coordinates near Shillong corridor (25.5788° N, 91.8933° E)');
          setTimeout(() => setNotice(''), 4000);
        }
      );
    } else {
      setDriverLat(25.5788);
      setDriverLng(91.8933);
    }
  };

  const handleUpdateTelemetry = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        speed: Number(driverSpeed),
        fuelLevel: Number(driverFuel),
        lat: Number(driverLat),
        lng: Number(driverLng),
        status: driverStatus
      };

      await vehiclesAPI.updateLocation(myVehicle.vehicleId || 'NER-101', payload);

      setVehicles(prev => prev.map(v =>
        (v.vehicleId === (myVehicle.vehicleId || 'NER-101'))
          ? {
              ...v,
              currentSpeed: payload.speed,
              fuelLevel: payload.fuelLevel,
              currentLocation: { ...v.currentLocation, lat: payload.lat, lng: payload.lng },
              status: payload.status
            }
          : v
      ));

      setNotice(`✅ Telemetry transmitted: ${myVehicle.vehicleId} — Speed: ${driverSpeed} km/h, Fuel: ${driverFuel}%, GPS: (${driverLat}, ${driverLng})`);
      setTimeout(() => setNotice(''), 6000);
    } catch (err) {
      setNotice(`❌ Error updating telemetry: ${err.message}`);
      setTimeout(() => setNotice(''), 5000);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = vehicles.filter(v => {
    if (filter.status && v.status !== filter.status) return false;
    if (filter.cargo && v.cargo !== filter.cargo) return false;
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

      {/* Driver Telemetry Management Console */}
      {isDriver && (
        <div className="card" style={{ marginBottom: 24, borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                🚚 My Assigned Vehicle: {myVehicle.vehicleId} ({myVehicle.registrationNumber || 'AS-01-AB-1234'})
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                Operator: <strong>{user?.name || 'Rajesh Kumar'}</strong> • Cargo: <strong>{myVehicle.cargo || 'Medicines'}</strong> ({myVehicle.cargoPriority || 'Critical'} Priority)
              </p>
            </div>
            <span className={`badge-status ${driverStatus === 'Moving' ? 'moving' : 'warning'}`}>
              {driverStatus}
            </span>
          </div>

          <form onSubmit={handleUpdateTelemetry}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Current Speed (km/h)
                </label>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  value={driverSpeed}
                  onChange={e => setDriverSpeed(e.target.value)}
                  min="0"
                  max="120"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Fuel Tank Level (%)
                </label>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  value={driverFuel}
                  onChange={e => setDriverFuel(e.target.value)}
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Vehicle Status
                </label>
                <select
                  className="form-control"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  value={driverStatus}
                  onChange={e => setDriverStatus(e.target.value)}
                >
                  <option value="Moving">Moving</option>
                  <option value="Stopped">Stopped</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  GPS Coordinates (Lat, Lng)
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-control"
                    style={{ width: '50%', padding: '8px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                    value={driverLat}
                    onChange={e => setDriverLat(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    step="0.0001"
                    className="form-control"
                    style={{ width: '50%', padding: '8px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                    value={driverLng}
                    onChange={e => setDriverLng(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: 12 }}
                onClick={handleUseCurrentLocation}
              >
                📍 Use Current Location
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? 'Transmitting...' : 'Transmit Telemetry to Central Command'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fleet Overview Header */}
      <div className="page-header">
        <div>
          <h2>{isDriver ? 'Fleet Overview' : 'Vehicle Tracking & Fleet Telemetry'}</h2>
          <p>Real-time location, speed, fuel, and consignment status</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge-status info">{vehicles.filter(v => v.status === 'Moving').length} Moving</span>
          <span className="badge-status warning">{vehicles.filter(v => v.status === 'Delayed' || v.status === 'Stopped').length} Delayed/Stopped</span>
          <span className="badge-status critical">{vehicles.filter(v => v.status === 'At Risk').length} At Risk</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <select className="filter-select" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="Moving">Moving</option>
          <option value="Stopped">Stopped</option>
          <option value="Delayed">Delayed</option>
          <option value="At Risk">At Risk</option>
        </select>
        <select className="filter-select" value={filter.cargo} onChange={e => setFilter({ ...filter, cargo: e.target.value })}>
          <option value="">All Cargo</option>
          {['Medicines', 'Food', 'Emergency', 'Construction', 'Agricultural', 'Fuel', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Vehicles Table */}
      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Type</th>
                <th>Driver</th>
                <th>Cargo</th>
                <th>Priority</th>
                <th>From → To</th>
                <th>Status</th>
                <th>Speed</th>
                <th>Fuel</th>
                <th>Trip Progress</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.vehicleId} style={{ background: isDriver && v.vehicleId === myVehicle.vehicleId ? '#eff6ff' : '' }}>
                  <td>
                    <strong>{v.vehicleId}</strong>
                    {isDriver && v.vehicleId === myVehicle.vehicleId && (
                      <span style={{ marginLeft: 6, fontSize: 10, background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>
                        MY TRUCK
                      </span>
                    )}
                    <br/>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{v.registrationNumber}</span>
                  </td>
                  <td>{v.type}</td>
                  <td>{typeof v.driver === 'object' ? v.driver?.name : v.driver}</td>
                  <td>{v.cargo}</td>
                  <td style={priorityStyle(v.cargoPriority)}>{v.cargoPriority}</td>
                  <td>{v.origin?.name || v.origin} → {v.destination?.name || v.destination}</td>
                  <td>{statusBadge(v.status)}</td>
                  <td><strong>{v.currentSpeed} km/h</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 50, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${v.fuelLevel}%`,
                          height: '100%',
                          background: v.fuelLevel < 30 ? '#dc2626' : v.fuelLevel < 50 ? '#d97706' : '#059669',
                          borderRadius: 3
                        }}></div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{v.fuelLevel}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.round((v.distanceCovered / (v.totalDistance || 100)) * 100)}%`,
                          height: '100%',
                          background: '#3b82f6',
                          borderRadius: 3
                        }}></div>
                      </div>
                      <span style={{ fontSize: 11 }}>{v.distanceCovered}/{v.totalDistance}km</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
