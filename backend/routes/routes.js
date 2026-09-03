const router = require('express').Router();
const Route = require('../models/Route');
const Road = require('../models/Road');
const { auth, authorize } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');

// Default initial routes if database is empty
const defaultRoutes = [
  { routeId: 'RT-NH27-01', roadId: 'NH-27-01', name: 'NH-27 Guwahati-Shillong Highway', origin: 'Guwahati', destination: 'Shillong', distance: '103 km', standardTime: '3h 30m', status: 'Open', riskLevel: 'Medium', disruptionProbability: 42 },
  { routeId: 'RT-NH37-01', roadId: 'NH-37-01', name: 'NH-37 Guwahati-Dimapur', origin: 'Guwahati', destination: 'Dimapur', distance: '320 km', standardTime: '8h 00m', status: 'Open', riskLevel: 'Low', disruptionProbability: 18 },
  { routeId: 'RT-NH02-MN', roadId: 'NH-02-MN', name: 'NH-2 Imphal-Dimapur Highway', origin: 'Imphal', destination: 'Dimapur', distance: '215 km', standardTime: '7h 00m', status: 'Risky', riskLevel: 'High', disruptionProbability: 78 },
  { routeId: 'RT-NH06-MZ', roadId: 'NH-06-MZ', name: 'NH-6 Aizawl-Silchar Road', origin: 'Aizawl', destination: 'Silchar', distance: '180 km', standardTime: '6h 30m', status: 'Blocked', riskLevel: 'Critical', disruptionProbability: 95 },
  { routeId: 'RT-NH10-SK', roadId: 'NH-10-SK', name: 'NH-10 Gangtok-Siliguri', origin: 'Gangtok', destination: 'Siliguri', distance: '114 km', standardTime: '4h 00m', status: 'Risky', riskLevel: 'High', disruptionProbability: 65 },
  { routeId: 'RT-NH39-NL', roadId: 'NH-39-NL', name: 'NH-39 Kohima-Imphal', origin: 'Kohima', destination: 'Imphal', distance: '137 km', standardTime: '5h 00m', status: 'Blocked', riskLevel: 'Critical', disruptionProbability: 92 },
  { routeId: 'RT-SH01-ML', roadId: 'SH-01-ML', name: 'SH-01 Shillong-Dawki Road', origin: 'Shillong', destination: 'Dawki', distance: '82 km', standardTime: '3h 00m', status: 'Open', riskLevel: 'Medium', disruptionProbability: 35 },
  { routeId: 'RT-SH02-TR', roadId: 'SH-02-TR', name: 'SH-02 Agartala-Udaipur Road', origin: 'Agartala', destination: 'Udaipur', distance: '55 km', standardTime: '1h 30m', status: 'Open', riskLevel: 'Low', disruptionProbability: 12 }
];

// Get all routes
router.get('/', async (req, res) => {
  try {
    let routes = await Route.find().sort({ routeId: 1 });
    if (routes.length === 0) {
      // Auto-populate default routes if none exist
      routes = await Route.insertMany(defaultRoutes);
    }
    res.json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get route by ID or roadId
router.get('/:id', async (req, res) => {
  try {
    const query = { $or: [{ routeId: req.params.id }, { roadId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }
    const route = await Route.findOne(query);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Select / Approve Alternate Bypass Route (Govt Official & Admin only)
router.put('/:id/reroute', auth, authorize('admin', 'government_official'), async (req, res) => {
  try {
    const query = { $or: [{ routeId: req.params.id }, { roadId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }

    let route = await Route.findOne(query);
    if (!route) {
      // Check if road exists, create route document
      const road = await Road.findOne({ roadId: req.params.id });
      if (road) {
        route = new Route({
          routeId: `RT-${road.roadId}`,
          roadId: road.roadId,
          name: road.name,
          origin: road.from || 'Origin',
          destination: road.to || 'Destination',
          status: road.status
        });
        await route.save();
      } else {
        return res.status(404).json({ success: false, message: 'Route not found' });
      }
    }

    const { alternativeName, via, distance, estimatedTime, extraTime, risk } = req.body;

    route.activeAlternative = {
      name: alternativeName || 'NH-44 Bypass',
      via: via || 'State Highway / Valley Bypass',
      distance: distance || '278 km',
      estimatedTime: estimatedTime || '7h 45m',
      extraTime: extraTime || '+42 minutes',
      risk: risk || 'Low',
      selectedBy: {
        name: req.user.name,
        role: req.user.role,
        userId: req.user._id
      },
      selectedAt: new Date(),
      status: 'Proposed',
      driverAccepted: false
    };

    await route.save();

    await logAudit(req, 'REROUTE_SELECTED', 'Route', route.routeId, {
      corridorName: route.name,
      selectedBypass: route.activeAlternative.name,
      extraTime: route.activeAlternative.extraTime
    });

    res.json({
      success: true,
      message: 'Alternative route selected and proposed to fleet drivers.',
      data: route
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Driver Accepts Reroute
router.put('/:id/accept-reroute', auth, authorize('driver', 'admin', 'government_official'), async (req, res) => {
  try {
    const query = { $or: [{ routeId: req.params.id }, { roadId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }

    const route = await Route.findOne(query);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });

    if (!route.activeAlternative || !route.activeAlternative.name) {
      return res.status(400).json({ success: false, message: 'No active alternative route proposed for this corridor.' });
    }

    route.activeAlternative.status = 'Accepted';
    route.activeAlternative.driverAccepted = true;
    route.activeAlternative.acceptedAt = new Date();

    await route.save();

    await logAudit(req, 'REROUTE_ACCEPTED', 'Route', route.routeId, {
      acceptedBy: req.user.name,
      bypassName: route.activeAlternative.name
    });

    res.json({
      success: true,
      message: 'Driver acknowledged and accepted bypass reroute.',
      data: route
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
