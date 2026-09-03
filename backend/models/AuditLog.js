const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'ROAD_STATUS_CHANGE',
      'INCIDENT_CREATED',
      'INCIDENT_STATUS_CHANGE',
      'INCIDENT_RESOLVED',
      'DELIVERY_CREATED',
      'DELIVERY_UPDATED',
      'DELIVERY_DELETED',
      'ALERT_BROADCAST',
      'ALERT_ACKNOWLEDGED',
      'REROUTE_SELECTED',
      'REROUTE_ACCEPTED',
      'TELEMETRY_UPDATED',
      'FIELD_REPORT_SYNCED',
      'FIELD_REPORT_CONVERTED'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Road', 'Incident', 'Delivery', 'Alert', 'Route', 'Vehicle', 'FieldReport']
  },
  entityId: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  performedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true }
  },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
