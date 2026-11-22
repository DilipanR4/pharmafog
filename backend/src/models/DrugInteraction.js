const mongoose = require('mongoose');

const drugInteractionSchema = new mongoose.Schema(
  {
    medicationA: {
      type: String,
      required: true,
      trim: true
    },
    medicationB: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['Major', 'Moderate', 'Minor'],
      required: true
    },
    mechanism: {
      type: String,
      required: true
    },
    clinicalEffect: {
      type: String,
      required: true
    },
    recommendation: {
      type: String,
      required: true
    },
    source: {
      type: String,
      default: 'PharmaFog Clinical Reference Database'
    },
    referenceStatus: {
      type: String,
      enum: ['Verified Clinical Reference', 'Demo Structured Rule'],
      default: 'Verified Clinical Reference'
    },
    category: {
      type: String,
      default: 'Pharmacological Interaction'
    }
  },
  { timestamps: true }
);

drugInteractionSchema.index({ medicationA: 1, medicationB: 1 });

module.exports = mongoose.model('DrugInteraction', drugInteractionSchema);
