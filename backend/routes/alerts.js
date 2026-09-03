const router = require('express').Router();
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');

// Get all alerts with filters
router.get('/', async (req, res) => {
  try {
    const { severity, isRead, type } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;
    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Broadcast new alert (Admin ONLY)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const count = await Alert.countDocuments();
    const alertId = req.body.alertId || `ALT-${String(count + 1).padStart(4, '0')}`;

    const alert = new Alert({
      ...req.body,
      alertId,
      createdAt: new Date()
    });
    await alert.save();

    await logAudit(req, 'ALERT_BROADCAST', 'Alert', alert.alertId, {
      title: alert.title,
      severity: alert.severity,
      message: alert.message,
      type: alert.type,
      location: alert.location?.name || alert.location?.district
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Acknowledge / Mark alert as read (All authenticated roles)
router.put('/:id/read', auth, async (req, res) => {
  try {
    const query = { $or: [{ alertId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }

    const alert = await Alert.findOneAndUpdate(
      query,
      { isRead: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    await logAudit(req, 'ALERT_ACKNOWLEDGED', 'Alert', alert.alertId, {
      title: alert.title,
      severity: alert.severity
    });

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get unread alert count
router.get('/unread/count', async (req, res) => {
  try {
    const count = await Alert.countDocuments({ isRead: false });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
