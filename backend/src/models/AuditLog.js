const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userEmail: {
      type: String,
      default: 'Anonymous / System'
    },
    userRole: {
      type: String,
      default: 'System'
    },
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ['Patient', 'Medication', 'Assessment', 'User', 'Reference', 'System'],
      default: 'System'
    },
    entityId: {
      type: String,
      default: ''
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
