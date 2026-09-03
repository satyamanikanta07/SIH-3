const mongoose = require('mongoose');

const fieldReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Heavy Traffic', 'Accident', 'Weather Hazard', 'Other'], required: true },
  description: { type: String, required: true },
  photograph: { type: String },
  location: {
    name: String,
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  reportedBy: {
    name: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phone: String
  },
  status: { type: String, enum: ['Pending', 'Synced', 'Reviewed', 'Converted to Incident'], default: 'Synced' },
  isOfflineReport: { type: Boolean, default: false },
  syncedAt: { type: Date },
  convertedIncidentId: String
}, { timestamps: true });

module.exports = mongoose.model('FieldReport', fieldReportSchema);
