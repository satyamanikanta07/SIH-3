const router = require('express').Router();
const District = require('../models/District');

const Road = require('../models/Road');
const Incident = require('../models/Incident');

router.get('/', async (req, res) => {
  try {
    const { state, riskLevel } = req.query;
    const filter = {};
    if (state) filter.state = state;
    if (riskLevel) filter.riskLevel = riskLevel;
    const districts = await District.find(filter).sort({ name: 1 });

    // Aggregate dynamic road and incident metrics
    const dynamicDistricts = await Promise.all(districts.map(async (d) => {
      const dObj = d.toObject();
      const roads = await Road.find({
        $or: [
          { district: d.name },
          { district: new RegExp(d.name, 'i') },
          { district: d.code }
        ]
      });

      if (roads.length > 0) {
        dObj.totalRoads = roads.length;
        dObj.openRoads = roads.filter(r => r.status === 'Open').length;
        dObj.riskyRoads = roads.filter(r => r.status === 'Risky').length;
        dObj.blockedRoads = roads.filter(r => r.status === 'Blocked').length;
        // Dynamically compute accessibility score
        const score = Math.round(((dObj.openRoads * 1.0 + dObj.riskyRoads * 0.5) / dObj.totalRoads) * 100);
        dObj.accessibilityScore = score;
        dObj.riskLevel = score >= 75 ? 'Low' : score >= 55 ? 'Medium' : 'High';
      }

      const incidentsCount = await Incident.countDocuments({
        $or: [
          { 'location.district': d.name },
          { 'location.district': new RegExp(d.name, 'i') }
        ],
        status: { $ne: 'Resolved' }
      });
      dObj.activeIncidents = incidentsCount;

      return dObj;
    }));

    res.json({ success: true, count: dynamicDistricts.length, data: dynamicDistricts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const district = await District.findOne({ code: req.params.code.toUpperCase() }) || await District.findById(req.params.code);
    if (!district) return res.status(404).json({ success: false, message: 'District not found' });
    res.json({ success: true, data: district });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
