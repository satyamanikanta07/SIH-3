const router = require('express').Router();
const Incident = require('../models/Incident');
const { auth, authorize } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');

// Get all incidents with filters
router.get('/', async (req, res) => {
  try {
    const { type, severity, status, district } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (district) filter['location.district'] = district;
    const incidents = await Incident.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get incident by ID
router.get('/:id', async (req, res) => {
  try {
    const query = { $or: [{ incidentId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }
    const incident = await Incident.findOne(query);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create incident (Admin, Govt Official, Field Officer)
router.post('/', auth, authorize('admin', 'government_official', 'field_officer'), async (req, res) => {
  try {
    const count = await Incident.countDocuments();
    const incidentId = req.body.incidentId || `INC-${String(count + 1).padStart(4, '0')}`;

    const incident = new Incident({
      ...req.body,
      incidentId,
      reportedBy: {
        name: req.user.name,
        role: req.user.role,
        userId: req.user._id
      }
    });
    await incident.save();

    await logAudit(req, 'INCIDENT_CREATED', 'Incident', incident.incidentId, {
      type: incident.type,
      severity: incident.severity,
      location: incident.location?.name
    });

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update incident status & details (Admin & Govt Official; ONLY Admin can resolve)
router.put('/:id', auth, authorize('admin', 'government_official'), async (req, res) => {
  try {
    const query = { $or: [{ incidentId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }

    const existing = await Incident.findOne(query);
    if (!existing) return res.status(404).json({ success: false, message: 'Incident not found' });

    // STRICT RBAC RULE: Only Admins can set status to 'Resolved'
    if (req.body.status === 'Resolved' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admins have authority to resolve incidents.'
      });
    }

    const updateData = { ...req.body };
    if (req.body.status === 'Resolved' && !existing.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    const incident = await Incident.findOneAndUpdate(query, updateData, { new: true });

    const auditAction = req.body.status === 'Resolved' ? 'INCIDENT_RESOLVED' : 'INCIDENT_STATUS_CHANGE';
    await logAudit(req, auditAction, 'Incident', incident.incidentId, {
      oldStatus: existing.status,
      newStatus: incident.status,
      type: incident.type,
      location: incident.location?.name
    });

    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
