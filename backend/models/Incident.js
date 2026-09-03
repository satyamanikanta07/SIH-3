const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Heavy Traffic', 'Accident', 'Weather Hazard', 'Other'], required: true },
  location: {
    name: { type: String, required: true },
    district: String,
    state: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  description: { type: String, required: true },
  photograph: { type: String },
  reportedBy: {
    name: String,
    role: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  status: { type: String, enum: ['Reported', 'Under Investigation', 'Confirmed', 'Resolved'], default: 'Reported' },
  affectedRoads: [{ type: String }],
  affectedVehicles: [{ type: String }],
  estimatedClearTime: { type: Date },
  resolvedAt: { type: Date },
  updates: [{
    message: String,
    updatedBy: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
