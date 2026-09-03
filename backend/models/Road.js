const mongoose = require('mongoose');

const roadSchema = new mongoose.Schema({
  roadId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['NH', 'SH', 'District', 'Rural', 'Bridge'], default: 'District' },
  status: { type: String, enum: ['Open', 'Risky', 'Blocked'], default: 'Open' },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  district: { type: String, required: true },
  state: { type: String, required: true },
  startPoint: {
    name: String,
    coordinates: { lat: Number, lng: Number }
  },
  endPoint: {
    name: String,
    coordinates: { lat: Number, lng: Number }
  },
  path: [{ lat: Number, lng: Number }],
  length: { type: Number }, // km
  condition: { type: String, enum: ['Good', 'Fair', 'Poor', 'Very Poor'], default: 'Good' },
  terrain: { type: String, enum: ['Plain', 'Hilly', 'Mountainous', 'Riverine'], default: 'Plain' },
  trafficLevel: { type: String, enum: ['Low', 'Moderate', 'Heavy', 'Standstill'], default: 'Low' },
  disruptionProbability: { type: Number, default: 0, min: 0, max: 100 },
  lastInspection: { type: Date },
  bridgeCondition: { type: String, enum: ['Good', 'Fair', 'Poor', 'Critical', 'N/A'], default: 'N/A' },
  floodRisk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  landslideRisk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  historicalIncidents: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Road', roadSchema);
