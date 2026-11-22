const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, entityType, entityId, details) => {
  try {
    const user = req && req.user ? req.user._id : null;
    const userEmail = req && req.user ? req.user.email : 'System';
    const userRole = req && req.user ? req.user.role : 'System';
    const ipAddress = (req && (req.headers['x-forwarded-for'] || req.socket.remoteAddress)) || '127.0.0.1';

    await AuditLog.create({
      user,
      userEmail,
      userRole,
      action,
      entityType,
      entityId: entityId ? String(entityId) : '',
      details: typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
      ipAddress: String(ipAddress).replace('::ffff:', '')
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = { logAudit };
