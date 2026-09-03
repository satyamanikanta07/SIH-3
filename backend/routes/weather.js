const router = require('express').Router();
const WeatherData = require('../models/WeatherData');

router.get('/:district', async (req, res) => {
  try {
    const weather = await WeatherData.findOne({ district: req.params.district }).sort({ recordedAt: -1 });
    if (!weather) return res.status(404).json({ success: false, message: 'Weather data not found for district' });
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    // Get latest weather for all districts
    const districts = await WeatherData.aggregate([
      { $sort: { recordedAt: -1 } },
      { $group: { _id: '$district', data: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$data' } }
    ]);
    res.json({ success: true, count: districts.length, data: districts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
