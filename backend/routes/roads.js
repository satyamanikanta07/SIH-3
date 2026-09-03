const router = require('express').Router();
const Road = require('../models/Road');
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

    res.json({ success: true, data: road });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.put('/:id', auth, authorize('admin', 'government_official'), updateRoadHandler);
router.patch('/:id', auth, authorize('admin', 'government_official'), updateRoadHandler);

module.exports = router;
