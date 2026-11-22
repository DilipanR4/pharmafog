const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null indicates broadcast to all clinical staff
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['alert', 'warning', 'info', 'success'],
      default: 'info'
    },
    priority: {
      type: String,
      enum: ['High', 'Moderate', 'Low'],
      default: 'Low'
    },
    relatedPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null
    },
    relatedAssessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicationAssessment',
      default: null
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
