const router = require('express').Router();
const Road = require('../models/Road');
const Alert = require('../models/Alert');
const Delivery = require('../models/Delivery');
const { auth, authorize } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');

// Get all roads with filters
router.get('/', async (req, res) => {
  try {
    const { status, district, riskLevel, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (district) filter.district = district;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (type) filter.type = type;

    const roads = await Road.find(filter).sort({ updatedAt: -1 });
    res.json({ success: true, count: roads.length, data: roads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get road by ID
router.get('/:id', async (req, res) => {
  try {
    const road = await Road.findOne({ roadId: req.params.id }) || await Road.findById(req.params.id);
    if (!road) return res.status(404).json({ success: false, message: 'Road not found' });
    res.json({ success: true, data: road });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get road stats
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Road.countDocuments();
    const open = await Road.countDocuments({ status: 'Open' });
    const risky = await Road.countDocuments({ status: 'Risky' });
    const blocked = await Road.countDocuments({ status: 'Blocked' });
    res.json({ success: true, data: { total, open, risky, blocked } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update road status (Admin & Government Official only)
const updateRoadHandler = async (req, res) => {
  try {
    const query = { $or: [{ roadId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }
    const existing = await Road.findOne(query);
    if (!existing) return res.status(404).json({ success: false, message: 'Road not found' });

    const oldStatus = existing.status;
    const updateData = { ...req.body, lastUpdated: new Date() };

    const road = await Road.findOneAndUpdate(query, updateData, { new: true });

    // Log action to audit trail
    await logAudit(req, 'ROAD_STATUS_CHANGE', 'Road', road.roadId, {
      roadName: road.name,
      oldStatus,
      newStatus: road.status,
      riskLevel: road.riskLevel,
      reason: req.body.reason || 'Road accessibility status update'
    });

    // Auto-generate system alert on road blockage (Requirement E)
    if (road.status === 'Blocked' && oldStatus !== 'Blocked') {
      try {
        const alertCount = await Alert.countDocuments();
        const alertId = `ALT-${String(alertCount + 1).padStart(4, '0')}`;
        await Alert.create({
          alertId,
          type: 'Road Blockage',
          severity: 'Critical',
          title: `${road.name} is BLOCKED`,
          message: `Corridor ${road.name} in ${road.district} is completely BLOCKED. Reason: ${req.body.reason || 'Landslide disruption'}. Alternate bypass required.`,
          location: {
            name: road.name,
            district: road.district,
            lat: road.startPoint?.coordinates?.lat || 25.5,
            lng: road.startPoint?.coordinates?.lng || 91.8
          },
          affectedEntities: {
            roads: [road.roadId],
            districts: [road.district]
          },
          alternateRouteAvailable: true,
          isRead: false
        });

        // Flag active deliveries along this corridor as At Risk
        await Delivery.updateMany(
          { route: road.roadId, status: { $in: ['In Transit', 'Pending', 'Assigned'] } },
          { $set: { status: 'At Risk' } }
        );
      } catch (alertErr) {
        console.warn('Failed to auto-generate alert on road blockage:', alertErr.message);
      }
    } else if (road.status === 'Open' && oldStatus === 'Blocked') {
      try {
        await Alert.updateMany(
          { 'affectedEntities.roads': road.roadId, isResolved: false },
          { $set: { isResolved: true, isRead: true, resolvedAt: new Date() } }
        );
      } catch (alertErr) {
        console.warn('Failed to resolve alert on road reopen:', alertErr.message);
      }
    }

    res.json({ success: true, data: road });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.put('/:id', auth, authorize('admin', 'government_official'), updateRoadHandler);
router.patch('/:id', auth, authorize('admin', 'government_official'), updateRoadHandler);

module.exports = router;
