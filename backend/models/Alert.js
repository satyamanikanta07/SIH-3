const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Road Blockage', 'High Disruption Risk', 'Heavy Rainfall', 'Flood Risk', 'Landslide Risk', 'Vehicle Delay', 'Delivery Delay', 'Accessibility Reduction', 'Weather Warning', 'Bridge Alert'], required: true },
  severity: { type: String, enum: ['Info', 'Warning', 'Critical'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  location: { name: String, district: String, lat: Number, lng: Number },
  affectedEntities: {
    roads: [String],
    vehicles: [String],
    deliveries: [String],
    districts: [String]
  },
  alternateRouteAvailable: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
  resolvedAt: Date,
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
