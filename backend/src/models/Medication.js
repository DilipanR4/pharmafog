const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    genericName: {
      type: String,
      required: [true, 'Generic name is required'],
      trim: true
    },
    brandName: {
      type: String,
      default: '',
      trim: true
    },
    activeIngredient: {
      type: String,
      default: '',
      trim: true
    },
    drugClass: {
      type: String,
      default: 'General'
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g. 5mg, 500mg)']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required (e.g. Once daily, Twice daily)']
    },
    route: {
      type: String,
      enum: ['Oral', 'Intravenous', 'Subcutaneous', 'Inhalation', 'Topical', 'Sublingual', 'Other'],
      default: 'Oral'
    },
    duration: {
      type: String,
      default: 'Ongoing'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['Active', 'Discontinued', 'Paused'],
      default: 'Active'
    },
    prescribedBy: {
      type: String,
      default: 'Attending Clinician'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

medicationSchema.index({ patient: 1, status: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
