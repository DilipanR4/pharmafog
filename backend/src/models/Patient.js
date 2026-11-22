const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 0,
      max: 130
    },
    sex: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Undisclosed'],
      default: 'Undisclosed'
    },
    weight: {
      type: Number, // in kg
      default: null
    },
    allergies: {
      type: [String],
      default: []
    },
    conditions: {
      type: [String],
      default: []
    },
    clinicalNotes: {
      type: String,
      default: ''
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    riskStatus: {
      type: String,
      enum: ['Not Evaluated', 'Low Risk', 'Moderate Risk', 'High Risk'],
      default: 'Not Evaluated'
    },
    lastRiskScore: {
      type: Number,
      default: null
    },
    lastEvaluatedAt: {
      type: Date,
      default: null
    },
    isDemo: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

patientSchema.index({ fullName: 'text', patientId: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
