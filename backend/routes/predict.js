const router = require('express').Router();
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Predict disruption risk
router.post('/disruption', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict-disruption`, req.body);
    res.json({ success: true, data: response.data });
  } catch (error) {
    // Fallback prediction if ML service is unavailable
    const { rainfall, road_condition, traffic_level, historical_incidents, slope_risk, flood_risk, bridge_condition, temperature } = req.body;
    
    let score = 0;
    score += (rainfall || 0) / 300 * 30;
    score += (road_condition === 'Very Poor' ? 20 : road_condition === 'Poor' ? 15 : road_condition === 'Fair' ? 8 : 3);
    score += (traffic_level === 'Standstill' ? 15 : traffic_level === 'Heavy' ? 10 : traffic_level === 'Moderate' ? 5 : 2);
    score += (historical_incidents || 0) * 3;
    score += (slope_risk || 0) / 100 * 10;
    score += (flood_risk === 'High' ? 15 : flood_risk === 'Medium' ? 8 : 3);
    score += (bridge_condition === 'Critical' ? 10 : bridge_condition === 'Poor' ? 7 : 2);
    
    const probability = Math.min(Math.round(score), 100);
    const riskLevel = probability >= 75 ? 'Critical' : probability >= 50 ? 'High' : probability >= 25 ? 'Medium' : 'Low';
    
    const factors = [];
    if ((rainfall || 0) > 100) factors.push('Heavy rainfall');
    if (road_condition === 'Poor' || road_condition === 'Very Poor') factors.push('Poor road condition');
    if ((historical_incidents || 0) > 3) factors.push('Previous incident history');
    if (flood_risk === 'High') factors.push('High flood risk');
    if (traffic_level === 'Heavy' || traffic_level === 'Standstill') factors.push('Heavy traffic');
    if (bridge_condition === 'Poor' || bridge_condition === 'Critical') factors.push('Bridge condition concern');
    
    res.json({
      success: true,
      data: {
        disruption_probability: probability,
        risk_level: riskLevel,
        contributing_factors: factors,
        is_demo: true,
        message: 'ML service unavailable - using fallback prediction'
      }
    });
  }
});

// Recommend route
router.post('/route', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend-route`, req.body);
    res.json({ success: true, data: response.data });
  } catch (error) {
    // Fallback route recommendation
    const { origin, destination, blocked_roads } = req.body;
    const routes = [
      {
        name: 'Route A (via NH-27)',
        distance: '245 km',
        estimatedTime: '6h 30m',
        risk: 'Low',
        status: 'Recommended',
        delay: '+0m',
        description: `${origin || 'Origin'} → NH-27 → ${destination || 'Destination'}`
      },
      {
        name: 'Route B (via State Highway)',
        distance: '278 km',
        estimatedTime: '7h 45m',
        risk: 'Medium',
        status: 'Alternative',
        delay: '+1h 15m',
        description: `${origin || 'Origin'} → SH-5 → SH-12 → ${destination || 'Destination'}`
      },
      {
        name: 'Route C (via District Roads)',
        distance: '312 km',
        estimatedTime: '9h 20m',
        risk: 'Low',
        status: 'Safest',
        delay: '+2h 50m',
        description: `${origin || 'Origin'} → District Rd → Rural Rd → ${destination || 'Destination'}`
      }
    ];
    res.json({ success: true, data: { routes, is_demo: true } });
  }
});

// Predict ETA
router.post('/eta', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict-eta`, req.body);
    res.json({ success: true, data: response.data });
  } catch (error) {
    const { distance, traffic_level, weather_condition, road_condition } = req.body;
    let avgSpeed = 40; // base km/h
    if (traffic_level === 'Heavy') avgSpeed -= 15;
    if (traffic_level === 'Standstill') avgSpeed -= 25;
    if (weather_condition === 'Heavy Rain' || weather_condition === 'Storm') avgSpeed -= 10;
    if (road_condition === 'Poor' || road_condition === 'Very Poor') avgSpeed -= 10;
    avgSpeed = Math.max(avgSpeed, 10);
    const hours = (distance || 100) / avgSpeed;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    res.json({ success: true, data: { eta: `${h}h ${m}m`, avgSpeed, is_demo: true } });
  }
});

module.exports = router;
