const mongoose = require('mongoose');

const medicationAssessmentSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: String,
      required: true,
      unique: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    patientSnapshot: {
      patientId: String,
      fullName: String,
      age: Number,
      sex: String,
      weight: Number,
      allergies: [String],
      conditions: [String]
    },
    medicationsSnapshot: [
      {
        genericName: String,
        brandName: String,
        dosage: String,
        frequency: String,
        route: String,
        drugClass: String,
        status: String
      }
    ],
    interactionsDetected: [
      {
        id: String,
        medicationA: String,
        medicationB: String,
        severity: String,
        mechanism: String,
        clinicalEffect: String,
        recommendation: String,
        source: String,
        referenceStatus: String,
        category: String
      }
    ],
    duplicatesDetected: [
      {
        type: { type: String },
        severity: String,
        medications: [String],
        activeIngredient: String,
        therapeuticCategory: String,
        description: String,
        clinicalAction: String
      }
    ],
    riskAnalysis: {
      score: { type: Number, required: true },
      riskLevel: {
        type: String,
        enum: ['Low Risk', 'Moderate Risk', 'High Risk'],
        required: true
      },
      badgeColor: String,
      summaryStatement: String,
      factors: [
        {
          factor: String,
          points: Number,
          detail: String,
          percentage: Number
        }
      ],
      allergyAlerts: [
        {
          medication: String,
          allergen: String,
          severity: String,
          explanation: String
        }
      ],
      beersFlaggedMedications: [String]
    },
    aiInsights: {
      executiveSummary: String,
      patientFriendlyTakeaways: [String],
      verificationFlags: [String],
      aiConfidenceNote: String,
      disclaimer: String
    },
    clinicianChecklist: [
      {
        id: String,
        category: String,
        action: String,
        rationale: String,
        priority: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
        completedBy: String
      }
    ],
    networkGraph: {
      totalNodes: Number,
      totalEdges: Number,
      density: Number,
      connectedComponents: Number,
      centrality: mongoose.Schema.Types.Mixed
    },
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

medicationAssessmentSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('MedicationAssessment', medicationAssessmentSchema);
