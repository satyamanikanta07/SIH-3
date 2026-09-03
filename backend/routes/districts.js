const router = require('express').Router();
const District = require('../models/District');

router.get('/', async (req, res) => {
  try {
    const { state, riskLevel } = req.query;
    const filter = {};
    if (state) filter.state = state;
    if (riskLevel) filter.riskLevel = riskLevel;
    const districts = await District.find(filter).sort({ name: 1 });
    res.json({ success: true, count: districts.length, data: districts });
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
