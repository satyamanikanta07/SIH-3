const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  district: { type: String, required: true },
  state: { type: String },
  temperature: { type: Number }, // celsius
  rainfall: { type: Number, default: 0 }, // mm
  humidity: { type: Number }, // %
  windSpeed: { type: Number }, // km/h
  windDirection: String,
  visibility: { type: Number }, // km
  condition: { type: String, enum: ['Clear', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Storm', 'Fog', 'Haze'], default: 'Clear' },
  floodRisk: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  warning: { type: String, default: '' },
  forecast: [{
    date: Date,
    condition: String,
    tempHigh: Number,
    tempLow: Number,
    rainfall: Number,
    floodRisk: String
  }],
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('WeatherData', weatherDataSchema);
