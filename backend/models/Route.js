const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  roadId: { type: String, required: true },
  name: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: String, default: '103 km' },
  standardTime: { type: String, default: '3h 30m' },
  status: { type: String, enum: ['Open', 'Risky', 'Blocked'], default: 'Open' },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  disruptionProbability: { type: Number, default: 0 },
  activeAlternative: {
    name: { type: String }, // e.g. 'NH-44 Bypass'
    via: { type: String },
    distance: { type: String },
    estimatedTime: { type: String },
    extraTime: { type: String }, // e.g. '+42 minutes'
    risk: { type: String, enum: ['Low', 'Medium', 'High'] },
    selectedBy: {
      name: String,
      role: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    selectedAt: { type: Date },
    status: { type: String, enum: ['None', 'Proposed', 'Accepted'], default: 'None' },
    driverAccepted: { type: Boolean, default: false },
    acceptedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
