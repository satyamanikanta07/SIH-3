const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, entityType, entityId, details) => {
  try {
    const user = req.user || {
      name: 'System / Anonymous',
      email: 'system@nerlogistics.gov.in',
      role: 'admin'
    };

    const logEntry = new AuditLog({
      action,
      entityType,
      entityId: String(entityId),
      details,
      performedBy: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      timestamp: new Date()
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = { logAudit };
