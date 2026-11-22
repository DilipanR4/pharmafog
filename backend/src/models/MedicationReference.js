const mongoose = require('mongoose');

const medicationReferenceSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    genericName: {
      type: String,
      required: true,
      trim: true
    },
    brandNames: {
      type: [String],
      default: []
    },
    drugClass: {
      type: String,
      required: true
    },
    therapeuticCategory: {
      type: String,
      default: 'General'
    },
    activeIngredient: {
      type: String,
      required: true
    },
    commonUsage: {
      type: String,
      default: ''
    },
    typicalDosage: {
      type: String,
      default: ''
    },
    route: {
      type: String,
      default: 'Oral'
    },
    beersCriteria: {
      type: Boolean,
      default: false
    },
    monitoringParameters: {
      type: [String],
      default: []
    },
    isDemo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

medicationReferenceSchema.index({ genericName: 'text', brandNames: 'text', activeIngredient: 'text' });

module.exports = mongoose.model('MedicationReference', medicationReferenceSchema);
