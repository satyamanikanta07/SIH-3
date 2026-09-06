/**
 * External Weather API Integration Service for NER Smart Logistics Platform.
 * Connects to external weather providers (e.g. OpenWeatherMap / IMD) with
 * environment variable configuration, in-memory caching, timeout safety,
 * and seamless fallback to regional database WeatherData.
 */

const axios = require('axios');
const WeatherData = require('../models/WeatherData');
const Road = require('../models/Road');

// Cache weather responses for 10 minutes to minimize external calls
const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || null;
    this.apiBaseUrl = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
    this.timeout = parseInt(process.env.WEATHER_API_TIMEOUT_MS, 10) || 4000;
  }

  /**
   * Get weather for a specific NER district with live API or fallback.
   * @param {string} district
   * @returns {Promise<Object>}
   */
  async getDistrictWeather(district) {
    const cached = weatherCache.get(district);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return { ...cached.data, cached: true };
    }

    let weatherResult = null;

    // 1. If external API key is provided, attempt live API call
    if (this.apiKey) {
      try {
        const response = await axios.get(`${this.apiBaseUrl}/weather`, {
          params: {
            q: `${district},IN`,
            appid: this.apiKey,
            units: 'metric'
          },
          timeout: this.timeout
        });

        const live = response.data;
        weatherResult = {
          district,
          temperature: Math.round(live.main?.temp || 24),
          rainfall: live.rain ? (live.rain['1h'] || live.rain['3h'] || 0) * 10 : 15,
          humidity: live.main?.humidity || 75,
          windSpeed: Math.round(live.wind?.speed ? live.wind.speed * 3.6 : 12),
          condition: live.weather?.[0]?.main || 'Cloudy',
          floodRisk: (live.rain && live.rain['1h'] > 10) ? 'High' : 'Low',
          isLiveApi: true,
          recordedAt: new Date()
        };
      } catch (err) {
        console.warn(`[WeatherService] External Weather API unavailable for ${district}: ${err.message}. Using database fallback.`);
      }
    }

    // 2. Fallback to MongoDB latest district record
    if (!weatherResult) {
      const dbRecord = await WeatherData.findOne({ district }).sort({ recordedAt: -1 });
      if (dbRecord) {
        weatherResult = {
          district: dbRecord.district,
          state: dbRecord.state,
          temperature: dbRecord.temperature,
          rainfall: dbRecord.rainfall,
          humidity: dbRecord.humidity,
          windSpeed: dbRecord.windSpeed,
          condition: dbRecord.condition,
          floodRisk: dbRecord.floodRisk,
          warning: dbRecord.warning,
          forecast: dbRecord.forecast,
          isLiveApi: false,
          recordedAt: dbRecord.recordedAt
        };
      } else {
        // Safe default regional fallback
        weatherResult = {
          district,
          temperature: 24,
          rainfall: 45,
          humidity: 82,
          windSpeed: 14,
          condition: 'Scattered Rain',
          floodRisk: 'Medium',
          isLiveApi: false,
          recordedAt: new Date()
        };
      }
    }

    weatherCache.set(district, { data: weatherResult, timestamp: Date.now() });
    return weatherResult;
  }

  /**
   * Get weather hazards across all monitored districts and identify impacted corridors.
   * @returns {Promise<Array>}
   */
  async getWeatherHazards() {
    const records = await WeatherData.find().sort({ rainfall: -1 });
    const hazards = [];

    for (const rec of records) {
      if (rec.rainfall >= 90 || rec.floodRisk === 'High' || rec.condition === 'Storm') {
        const affectedRoads = await Road.find({ district: rec.district }, 'roadId name status riskLevel');
        hazards.push({
          district: rec.district,
          state: rec.state,
          rainfall: rec.rainfall,
          condition: rec.condition,
          floodRisk: rec.floodRisk,
          severity: rec.rainfall >= 140 ? 'Critical' : 'High',
          warning: rec.warning || `Severe weather hazard in ${rec.district}. High disruption potential.`,
          affectedRoads: affectedRoads.map(r => ({ roadId: r.roadId, name: r.name, status: r.status }))
        });
      }
    }
    return hazards;
  }
}

module.exports = new WeatherService();
