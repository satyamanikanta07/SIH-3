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

// Dynamic AI Logistics Intelligence Insights (Requirement 14)
router.get('/insights', auth, async (req, res) => {
  try {
    const WeatherData = require('../models/WeatherData');
    const insights = [];

    // 1. Weather hazard insights
    const severeWeather = await WeatherData.find({
      $or: [{ rainfall: { $gte: 90 } }, { floodRisk: 'High' }, { condition: 'Storm' }]
    }).limit(2);

    severeWeather.forEach(w => {
      insights.push({
        icon: '🌧️',
        type: 'Weather Hazard',
        text: `Heavy precipitation (${w.rainfall} mm, ${w.condition}) detected in ${w.district}. Elevated soil saturation and slope hazard on connecting corridors.`
      });
    });

    // 2. Blocked corridors insight
    const blockedRoads = await Road.find({ status: 'Blocked' }).limit(3);
    if (blockedRoads.length > 0) {
      const names = blockedRoads.map(r => r.name).join(', ');
      insights.push({
        icon: '🚫',
        type: 'Road Closure',
        text: `${blockedRoads.length} major corridor(s) blocked (${names}). Multi-agency bypass rerouting in effect.`
      });
    }

    // 3. Critical deliveries delay insight
    const delayedDeliveries = await Delivery.find({
      priority: 'Critical',
      status: { $in: ['Delayed', 'At Risk'] }
    }).limit(2);

    delayedDeliveries.forEach(d => {
      insights.push({
        icon: d.cargo === 'Medicines' ? '💊' : '📦',
        type: 'Supply Chain Delay',
        text: `Critical ${d.cargo.toLowerCase()} consignment ${d.deliveryId} to ${d.destination?.name || 'Destination'} is delayed by ${d.delay || 45} min. AI alternate corridor recommended.`
      });
    });

    // 4. Vehicle movement insight
    const atRiskVehicles = await Vehicle.countDocuments({ status: { $in: ['Delayed', 'At Risk'] } });
    if (atRiskVehicles > 0) {
      insights.push({
        icon: '🚛',
        type: 'Fleet Telematics',
        text: `${atRiskVehicles} commercial transport vehicles experiencing transit delays due to mountainous topography and road conditions.`
      });
    }

    // 5. Active incidents insight
    const activeInc = await Incident.countDocuments({ status: { $ne: 'Resolved' } });
    if (activeInc > 0) {
      insights.push({
        icon: '⚠️',
        type: 'Ground Incidents',
        text: `${activeInc} active incident(s) being managed across North Eastern Region districts.`
      });
    }

    // Fallback if network is completely serene
    if (insights.length === 0) {
      insights.push({
        icon: '✅',
        type: 'Normal Operations',
        text: 'All major NER corridors operating smoothly. No severe disruptions or critical consignment delays detected.'
      });
    }

    res.json({ success: true, count: insights.length, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Logistics Bottleneck Analysis (Requirement 18 - Admin & Govt Official)
router.get('/bottlenecks', auth, authorize('admin', 'government_official'), async (req, res) => {
  try {
    const District = require('../models/District');

    // Most disrupted roads
    const mostDisruptedRoads = await Road.find({
      $or: [{ status: { $in: ['Blocked', 'Risky'] } }, { disruptionProbability: { $gte: 50 } }]
    }).sort({ disruptionProbability: -1, status: 1 }).limit(6);

    // Most delayed deliveries
    const mostDelayedDeliveries = await Delivery.find({
      delay: { $gt: 0 }
    }).sort({ delay: -1 }).limit(6);

    // High-risk districts
    const highRiskDistricts = await District.find().sort({ accessibilityScore: 1 }).limit(6);

    // Incident hotspots
    const incidentHotspots = await Incident.aggregate([
      { $match: { status: { $ne: 'Resolved' } } },
      { $group: { _id: '$location.district', count: { $sum: 1 }, criticalCount: { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Cargo performance breakdown (delay & trips by cargo type)
    const cargoPerformance = await Delivery.aggregate([
      {
        $group: {
          _id: '$cargo',
          avgDelay: { $avg: '$delay' },
          trips: { $sum: 1 },
          delayedTrips: { $sum: { $cond: [{ $gt: ['$delay', 0] }, 1, 0] } }
        }
      },
      {
        $project: {
          name: '$_id',
          avgDelay: { $round: ['$avgDelay', 0] },
          trips: 1,
          delayedTrips: 1
        }
      },
      { $sort: { avgDelay: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        mostDisruptedRoads,
        mostDelayedDeliveries,
        highRiskDistricts,
        incidentHotspots,
        cargoPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
