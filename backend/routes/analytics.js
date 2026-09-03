const router = require('express').Router();
const Road = require('../models/Road');
const Vehicle = require('../models/Vehicle');
const Incident = require('../models/Incident');
const Delivery = require('../models/Delivery');
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');

// High-level overview (Accessible to all authenticated users for Dashboard counters)
router.get('/overview', auth, async (req, res) => {
  try {
    const [totalRoads, openRoads, riskyRoads, blockedRoads] = await Promise.all([
      Road.countDocuments(),
      Road.countDocuments({ status: 'Open' }),
      Road.countDocuments({ status: 'Risky' }),
      Road.countDocuments({ status: 'Blocked' })
    ]);

    const [totalVehicles, movingVehicles, delayedVehicles] = await Promise.all([
      Vehicle.countDocuments({ isActive: true }),
      Vehicle.countDocuments({ status: 'Moving' }),
      Vehicle.countDocuments({ status: 'Delayed' })
    ]);

    const [totalIncidents, activeIncidents] = await Promise.all([
      Incident.countDocuments(),
      Incident.countDocuments({ status: { $ne: 'Resolved' } })
    ]);

    const [totalDeliveries, delayedDeliveries, inTransit] = await Promise.all([
      Delivery.countDocuments(),
      Delivery.countDocuments({ status: 'Delayed' }),
      Delivery.countDocuments({ status: 'In Transit' })
    ]);

    const criticalAlerts = await Alert.countDocuments({ severity: 'Critical', isRead: false });

    res.json({
      success: true,
      data: {
        roads: { total: totalRoads, open: openRoads, risky: riskyRoads, blocked: blockedRoads },
        vehicles: { total: totalVehicles, moving: movingVehicles, delayed: delayedVehicles },
        incidents: { total: totalIncidents, active: activeIncidents },
        deliveries: { total: totalDeliveries, delayed: delayedDeliveries, inTransit },
        criticalAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Incidents by type (Admin & Government Official only)
router.get('/incidents-by-type', auth, authorize('admin', 'government_official'), async (req, res) => {
  try {
    const data = await Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Deliveries by status (Admin & Government Official only)
router.get('/deliveries-by-status', auth, authorize('admin', 'government_official'), async (req, res) => {
  try {
    const data = await Delivery.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Roads by district (Admin & Government Official only)
router.get('/roads-by-district', auth, authorize('admin', 'government_official'), async (req, res) => {
  try {
    const data = await Road.aggregate([
      {
        $group: {
          _id: '$district',
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
          risky: { $sum: { $cond: [{ $eq: ['$status', 'Risky'] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ['$status', 'Blocked'] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
