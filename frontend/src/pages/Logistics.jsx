import { useState, useEffect } from 'react';
import { deliveriesAPI, vehiclesAPI } from '../services/api';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const demoDeliveries = [
  { deliveryId: 'DEL-0001', vehicleId: 'NER-101', cargo: 'Medicines', cargoDescription: 'Essential medicines and vaccines', origin: { name: 'Guwahati Medical Store', district: 'Kamrup Metropolitan' }, destination: { name: 'Shillong Civil Hospital', district: 'East Khasi Hills' }, priority: 'Critical', status: 'In Transit', delay: 45, route: 'NH-27-01', weight: 500, driver: { name: 'Rajesh Kumar' } },
  { deliveryId: 'DEL-0002', vehicleId: 'NER-102', cargo: 'Food', cargoDescription: 'Emergency food supplies', origin: { name: 'Shillong Warehouse', district: 'East Khasi Hills' }, destination: { name: 'Tura Relief Camp', district: 'West Garo Hills' }, priority: 'High', status: 'In Transit', delay: 0, route: 'SH-03-WG', weight: 2000, driver: { name: 'Bimal Das' } },
  { deliveryId: 'DEL-0003', vehicleId: 'NER-103', cargo: 'Emergency', cargoDescription: 'Emergency medical team', origin: { name: 'RIMS Hospital Imphal', district: 'Imphal West' }, destination: { name: 'Churachandpur Hospital', district: 'Imphal West' }, priority: 'Critical', status: 'In Transit', delay: 0, route: 'NH-02-MN', weight: 200, driver: { name: 'Tomba Singh' } },
  { deliveryId: 'DEL-0004', vehicleId: 'NER-104', cargo: 'Construction', cargoDescription: 'Road repair materials', origin: { name: 'Guwahati Yard', district: 'Kamrup Metropolitan' }, destination: { name: 'Dimapur PWD', district: 'Dimapur' }, priority: 'Medium', status: 'Delayed', delay: 120, route: 'NH-37-01', weight: 5000, driver: { name: 'Abdul Rahman' } },
  { deliveryId: 'DEL-0005', vehicleId: 'NER-105', cargo: 'Medicines', cargoDescription: 'Anti-malaria drugs', origin: { name: 'Siliguri Depot', district: 'East Sikkim' }, destination: { name: 'Gangtok Health Center', district: 'East Sikkim' }, priority: 'Critical', status: 'At Risk', delay: 90, route: 'NH-10-SK', weight: 350, driver: { name: 'Pempa Sherpa' } },
  { deliveryId: 'DEL-0006', vehicleId: 'NER-106', cargo: 'Agricultural', cargoDescription: 'Seeds and fertilizers', origin: { name: 'Agartala Depot', district: 'West Tripura' }, destination: { name: 'Udaipur Farm', district: 'West Tripura' }, priority: 'Medium', status: 'In Transit', delay: 0, route: 'SH-02-TR', weight: 3000, driver: { name: 'Subhash Debnath' } },
  { deliveryId: 'DEL-0007', vehicleId: 'NER-107', cargo: 'Fuel', cargoDescription: 'Diesel for power station', origin: { name: 'Dimapur Fuel Depot', district: 'Dimapur' }, destination: { name: 'Kohima Power Station', district: 'Kohima' }, priority: 'High', status: 'Delayed', delay: 180, route: 'DR-02-DIM', weight: 8000, driver: { name: 'Kevi Zhimo' } },
  { deliveryId: 'DEL-0008', vehicleId: 'NER-108', cargo: 'Food', cargoDescription: 'Essential food supplies', origin: { name: 'Silchar Supply', district: 'Aizawl' }, destination: { name: 'Aizawl Warehouse', district: 'Aizawl' }, priority: 'Critical', status: 'Delayed', delay: 360, route: 'NH-06-MZ', weight: 4000, driver: { name: 'Lalthianga' } },
  { deliveryId: 'DEL-0009', vehicleId: 'NER-109', cargo: 'Agricultural', cargoDescription: 'Tea processing equipment', origin: { name: 'Tinsukia Depot', district: 'Tinsukia' }, destination: { name: 'Doom Dooma', district: 'Tinsukia' }, priority: 'Low', status: 'In Transit', delay: 0, route: 'NH-29-AS', weight: 1500, driver: { name: 'Mohan Bora' } },
  { deliveryId: 'DEL-0010', vehicleId: 'NER-110', cargo: 'General', cargoDescription: 'Office supplies', origin: { name: 'Tezpur Supply', district: 'Sonitpur' }, destination: { name: 'Guwahati Secretariat', district: 'Kamrup Metropolitan' }, priority: 'Low', status: 'In Transit', delay: 0, route: 'NH-15-AS', weight: 800, driver: { name: 'Deepak Saikia' } },
];

const priorityStyle = (p) => p === 'Critical' ? 'priority-critical' : p === 'High' ? 'priority-high' : '';
const statusCls = (s) => s === 'In Transit' ? 'in-transit' : s === 'Delivered' ? 'delivered' : s === 'Delayed' ? 'delayed' : s === 'At Risk' ? 'at-risk' : s === 'Cancelled' ? 'cancelled' : 'pending';

export default function Logistics({ user }) {
  const [deliveries, setDeliveries] = useState(demoDeliveries);
  const [filters, setFilters] = useState({ status: '', priority: '', cargo: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [notice, setNotice] = useState('');
  const [formData, setFormData] = useState({
    deliveryId: '',
    cargo: 'Medicines',
    cargoDescription: 'Emergency Medicines',
    priority: 'Critical',
    vehicleId: 'NER-101',
    driverName: 'Rajesh Kumar',
    origin: 'Guwahati Medical Store',
    destination: 'Shillong Civil Hospital',
    status: 'In Transit',
    weight: 500
  });

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';

  const loadDeliveries = () => {
    const fetchCall = isDriver ? deliveriesAPI.getMyDeliveries() : deliveriesAPI.getAll();
    fetchCall.then(res => {
      if (res?.data) {
        if (isDriver && res.data.length === 0) {
          // Fallback to filtering demo deliveries for driver
          setDeliveries(demoDeliveries.filter(d => d.vehicleId === 'NER-101' || d.driver?.name === 'Rajesh Kumar'));
        } else if (res.data.length > 0) {
          setDeliveries(res.data);
        }
      }
    }).catch(() => {
      if (isDriver) {
        setDeliveries(demoDeliveries.filter(d => d.vehicleId === 'NER-101' || d.driver?.name === 'Rajesh Kumar'));
      }
    });
  };

  useEffect(() => {
    loadDeliveries();
  }, [user]);

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        deliveryId: formData.deliveryId || `DEL-${String(deliveries.length + 1).padStart(4, '0')}`,
        cargo: formData.cargo,
        cargoDescription: formData.cargoDescription,
        priority: formData.priority,
        vehicleId: formData.vehicleId,
        driver: { name: formData.driverName },
        origin: { name: formData.origin, district: 'Kamrup Metropolitan' },
        destination: { name: formData.destination, district: 'East Khasi Hills' },
        status: formData.status,
        weight: Number(formData.weight) || 500,
        delay: 0
      };

      await deliveriesAPI.create(payload);
      setDeliveries(prev => [payload, ...prev]);
      setNotice(`✅ Delivery ${payload.deliveryId} created successfully for ${formData.destination}`);
      setShowCreateModal(false);
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setNotice(`❌ Error creating delivery: ${err.message}`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  const handleUpdateDelivery = async (e) => {
    e.preventDefault();
    if (!editingDelivery) return;
    try {
      await deliveriesAPI.update(editingDelivery.deliveryId, {
        priority: editingDelivery.priority,
        status: editingDelivery.status,
        vehicleId: editingDelivery.vehicleId,
        driver: editingDelivery.driver
      });

      setDeliveries(prev => prev.map(d =>
        d.deliveryId === editingDelivery.deliveryId ? editingDelivery : d
      ));

      setNotice(`✅ Delivery ${editingDelivery.deliveryId} updated successfully`);
      setEditingDelivery(null);
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setNotice(`❌ Error updating delivery: ${err.message}`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  const handleDeleteDelivery = async (id) => {
    if (!window.confirm(`Are you sure you want to cancel delivery ${id}?`)) return;
    try {
      await deliveriesAPI.delete(id);
      setDeliveries(prev => prev.filter(d => d.deliveryId !== id));
      setNotice(`✅ Delivery ${id} has been cancelled`);
      setTimeout(() => setNotice(''), 5000);
    } catch (err) {
      setNotice(`❌ Error deleting delivery: ${err.message}`);
      setTimeout(() => setNotice(''), 5000);
    }
  };

  const filtered = deliveries.filter(d => {
    if (filters.status && d.status !== filters.status) return false;
    if (filters.priority && d.priority !== filters.priority) return false;
    if (filters.cargo && d.cargo !== filters.cargo) return false;
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

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>{isDriver ? 'My Assigned Deliveries' : 'Logistics Management'}</h2>
          <p>{isDriver ? 'Active consignments assigned to your vehicle' : 'Track and dispatch critical logistics across the NER'}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus /> Create Delivery
            </button>
          )}
          <span className="badge-status in-transit">{deliveries.filter(d => d.status === 'In Transit').length} In Transit</span>
          <span className="badge-status delayed">{deliveries.filter(d => d.status === 'Delayed').length} Delayed</span>
        </div>
      </div>

      {/* Create Delivery Modal (Admin Only) */}
      {showCreateModal && isAdmin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>
              Dispatch New Logistics Consignment
            </h3>
            <form onSubmit={handleCreateDelivery}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Delivery ID</label>
                  <input className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    placeholder="NER-105" value={formData.deliveryId} onChange={e => setFormData({ ...formData, deliveryId: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Cargo Type</label>
                  <select className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    value={formData.cargo} onChange={e => setFormData({ ...formData, cargo: e.target.value })}>
                    {['Medicines', 'Food', 'Emergency', 'Construction', 'Agricultural', 'Fuel', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Cargo Description</label>
                <input className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  placeholder="Emergency Medicines & Pediatric Vaccines" value={formData.cargoDescription} onChange={e => setFormData({ ...formData, cargoDescription: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Priority</label>
                  <select className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Assigned Vehicle</label>
                  <input className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    placeholder="NER-101" value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Driver Name</label>
                  <input className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    placeholder="Rajesh Kumar" value={formData.driverName} onChange={e => setFormData({ ...formData, driverName: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Weight (kg)</label>
                  <input type="number" className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Origin</label>
                  <input className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Destination</label>
                  <input className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Dispatch Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Delivery Modal (Admin Only) */}
      {editingDelivery && isAdmin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 440, width: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#0f172a' }}>
              Edit Consignment: {editingDelivery.deliveryId}
            </h3>
            <form onSubmit={handleUpdateDelivery}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Cargo Priority</label>
                <select className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  value={editingDelivery.priority} onChange={e => setEditingDelivery({ ...editingDelivery, priority: e.target.value })}>
                  {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Delivery Status</label>
                <select className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  value={editingDelivery.status} onChange={e => setEditingDelivery({ ...editingDelivery, status: e.target.value })}>
                  {['Pending', 'In Transit', 'Delivered', 'Delayed', 'At Risk', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Reassign Vehicle ID</label>
                <input className="form-control" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  value={editingDelivery.vehicleId} onChange={e => setEditingDelivery({ ...editingDelivery, vehicleId: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingDelivery(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="filters-bar">
        <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {['Pending', 'In Transit', 'Delivered', 'Delayed', 'At Risk', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priority</option>
          {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="filter-select" value={filters.cargo} onChange={e => setFilters({ ...filters, cargo: e.target.value })}>
          <option value="">All Cargo</option>
          {['Medicines', 'Food', 'Emergency', 'Construction', 'Agricultural', 'Fuel', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Deliveries Table */}
      <div className="card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Cargo</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Delay</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(del => (
                <tr key={del.deliveryId} style={{ background: del.priority === 'Critical' && del.status !== 'Delivered' ? '#fef2f2' : '' }}>
                  <td><strong>{del.deliveryId}</strong></td>
                  <td>{del.vehicleId}</td>
                  <td>{del.driver?.name || 'Assigned Driver'}</td>
                  <td>{del.cargo}<br/><span style={{ fontSize: 11, color: '#94a3b8' }}>{del.cargoDescription}</span></td>
                  <td>{del.origin?.name || del.origin}<br/><span style={{ fontSize: 11, color: '#94a3b8' }}>{del.origin?.district}</span></td>
                  <td>{del.destination?.name || del.destination}<br/><span style={{ fontSize: 11, color: '#94a3b8' }}>{del.destination?.district}</span></td>
                  <td><span className={priorityStyle(del.priority)}>{del.priority}</span></td>
                  <td><span className={`badge-status ${statusCls(del.status)}`}>{del.status}</span></td>
                  <td style={{ color: del.delay > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>
                    {del.delay > 0 ? `+${del.delay >= 60 ? Math.floor(del.delay / 60) + 'h ' + (del.delay % 60) + 'm' : del.delay + 'm'}` : 'On Time'}
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setEditingDelivery(del)} title="Edit Priority & Reassign">
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12, color: '#dc2626' }} onClick={() => handleDeleteDelivery(del.deliveryId)} title="Cancel Delivery">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No deliveries found matching the current criteria.
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
