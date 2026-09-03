const router = require('express').Router();
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');

// Get audit logs (Admin & Government Official only)
router.get('/', auth, authorize('admin', 'government_official'), async (req, res) => {
  try {
    const { action, entityType, limit = 50 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
