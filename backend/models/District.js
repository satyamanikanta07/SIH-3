const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  center: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  population: Number,
  area: Number, // sq km
  accessibilityScore: { type: Number, default: 100, min: 0, max: 100 },
  totalRoads: { type: Number, default: 0 },
  openRoads: { type: Number, default: 0 },
  riskyRoads: { type: Number, default: 0 },
  blockedRoads: { type: Number, default: 0 },
  activeIncidents: { type: Number, default: 0 },
  activeVehicles: { type: Number, default: 0 },
  criticalDeliveries: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  weatherCondition: { type: String, default: 'Clear' },
  connectivity: { type: String, enum: ['Good', 'Moderate', 'Poor', 'Disconnected'], default: 'Good' }
}, { timestamps: true });

module.exports = mongoose.model('District', districtSchema);
