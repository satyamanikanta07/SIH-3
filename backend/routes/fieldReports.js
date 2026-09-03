const router = require('express').Router();
const FieldReport = require('../models/FieldReport');
const Incident = require('../models/Incident');
const { auth, authorize } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');

// Get all field reports with filters
router.get('/', async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    const reports = await FieldReport.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit field report (Admin, Govt Official, Field Officer)
router.post('/', auth, authorize('admin', 'government_official', 'field_officer'), async (req, res) => {
  try {
    const count = await FieldReport.countDocuments();
    const reportId = req.body.reportId || `FR-${String(count + 1).padStart(4, '0')}`;

    const report = new FieldReport({
      ...req.body,
      reportId,
      reportedBy: {
        name: req.user.name,
        role: req.user.role,
        userId: req.user._id
      },
      syncedAt: new Date()
    });
    await report.save();

    await logAudit(req, 'FIELD_REPORT_SYNCED', 'FieldReport', report.reportId, {
      type: report.type,
      location: report.location?.name,
      severity: report.severity
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Batch sync offline reports (Admin, Govt Official, Field Officer)
router.post('/sync', auth, authorize('admin', 'government_official', 'field_officer'), async (req, res) => {
  try {
    const { reports } = req.body;
    if (!Array.isArray(reports) || reports.length === 0) {
      return res.status(400).json({ success: false, message: 'No reports provided for synchronization' });
    }

    const savedReports = [];
    for (const reportData of reports) {
      let repId = reportData.reportId;
      if (!repId) {
        const count = await FieldReport.countDocuments();
        repId = `FR-${String(count + 1).padStart(4, '0')}`;
      }
      const report = await FieldReport.findOneAndUpdate(
        { reportId: repId },
        {
          ...reportData,
          reportId: repId,
          reportedBy: {
            name: req.user.name,
            role: req.user.role,
            userId: req.user._id
          },
          isOfflineReport: true,
          syncedAt: new Date(),
          status: 'Synced'
        },
        { upsert: true, new: true }
      );
      savedReports.push(report);
    }

    await logAudit(req, 'FIELD_REPORT_SYNCED', 'FieldReport', `BATCH-${savedReports.length}`, {
      syncedCount: savedReports.length
    });

    res.status(201).json({ success: true, count: savedReports.length, data: savedReports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Convert field report into official incident (Admin & Govt Official only)
router.put('/:id/convert', auth, authorize('admin', 'government_official'), async (req, res) => {
  try {
    const query = { $or: [{ reportId: req.params.id }] };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: req.params.id });
    }

    const report = await FieldReport.findOne(query);
    if (!report) return res.status(404).json({ success: false, message: 'Field report not found' });

    const incCount = await Incident.countDocuments();
    const incidentId = `INC-${String(incCount + 1).padStart(4, '0')}`;

    const incident = new Incident({
      incidentId,
      type: report.type || 'Landslide',
      location: {
        name: report.location?.name || 'Field Location',
        district: report.location?.district || 'General NER',
        coordinates: {
          lat: report.location?.lat || 25.5,
          lng: report.location?.lng || 91.8
        }
      },
      severity: report.severity || 'Medium',
      description: `[Converted from Field Report ${report.reportId}] ${report.description}`,
      reportedBy: {
        name: report.reportedBy?.name || req.user.name,
        role: report.reportedBy?.role || req.user.role,
        userId: req.user._id
      },
      status: 'Confirmed',
      confirmedBy: {
        name: req.user.name,
        role: req.user.role,
        at: new Date()
      }
    });
    await incident.save();

    report.status = 'Converted to Incident';
    await report.save();

    await logAudit(req, 'FIELD_REPORT_CONVERTED', 'FieldReport', report.reportId, {
      convertedToIncidentId: incident.incidentId,
      type: incident.type,
      location: incident.location?.name
    });

    res.json({ success: true, message: 'Report converted to official incident', data: { report, incident } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
