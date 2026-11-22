const MedicationAssessment = require('../models/MedicationAssessment');
const Patient = require('../models/Patient');
const Medication = require('../models/Medication');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const AIService = require('../services/aiService');
const PDFService = require('../services/pdfService');
const { logAudit } = require('../middleware/auditLogger');

exports.runAssessment = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const medications = await Medication.find({ patient: patient._id, status: 'Active' });

    if (medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient has no active medications to analyze. Please add at least one medication.'
      });
    }

    // Call AI / Polypharmacy analysis service
    const analysisResult = await AIService.analyzeMedications(patient, medications);

    const year = new Date().getFullYear();
    const count = await MedicationAssessment.countDocuments({});
    const assessmentId = `PF-ASM-${year}-${String(count + 1).padStart(4, '0')}`;

    // Normalize checklist
    const rawChecklist = analysisResult.clinician_checklist || analysisResult.clinicianChecklist || [];
    const formattedChecklist = rawChecklist.map(c => ({
      id: c.id,
      category: c.category,
      action: c.action,
      rationale: c.rationale,
      priority: c.priority,
      completed: false
    }));

    // Normalize duplicates
    const rawDuplicates = analysisResult.duplicates || [];
    const formattedDuplicates = rawDuplicates.map(d => ({
      type: d.type,
      severity: d.severity,
      medications: d.medications,
      activeIngredient: d.active_ingredient || d.activeIngredient || '',
      therapeuticCategory: d.therapeutic_category || d.therapeuticCategory || '',
      description: d.description,
      clinicalAction: d.clinical_action || d.clinicalAction || ''
    }));

    // Normalize interactions
    const rawInteractions = analysisResult.interactions || [];
    const formattedInteractions = rawInteractions.map(i => ({
      id: i.id,
      medicationA: i.medication_a || i.medicationA,
      medicationB: i.medication_b || i.medicationB,
      severity: i.severity,
      mechanism: i.mechanism,
      clinicalEffect: i.clinical_effect || i.clinicalEffect,
      recommendation: i.recommendation,
      source: i.source,
      referenceStatus: i.reference_status || i.referenceStatus || 'Verified Clinical Reference',
      category: i.category || 'General Interaction'
    }));

    // Normalize risk
    const rawRisk = analysisResult.risk_analysis || analysisResult.riskAnalysis || {};
    const formattedRisk = {
      score: rawRisk.score || 0,
      riskLevel: rawRisk.risk_level || rawRisk.riskLevel || 'Low Risk',
      badgeColor: rawRisk.badge_color || rawRisk.badgeColor || 'teal',
      summaryStatement: rawRisk.summary_statement || rawRisk.summaryStatement || '',
      factors: (rawRisk.factors || []).map(f => ({
        factor: f.factor,
        points: f.points,
        detail: f.detail,
        percentage: f.percentage
      })),
      allergyAlerts: (rawRisk.allergy_alerts || rawRisk.allergyAlerts || []).map(a => ({
        medication: a.medication,
        allergen: a.allergen,
        severity: a.severity,
        explanation: a.explanation
      })),
      beersFlaggedMedications: rawRisk.beers_flagged_medications || rawRisk.beersFlaggedMedications || []
    };

    // Normalize AI insights
    const rawInsights = analysisResult.ai_insights || analysisResult.aiInsights || {};
    const formattedInsights = {
      executiveSummary: rawInsights.executive_summary || rawInsights.executiveSummary || '',
      patientFriendlyTakeaways: rawInsights.patient_friendly_takeaways || rawInsights.patientFriendlyTakeaways || [],
      verificationFlags: rawInsights.verification_flags || rawInsights.verificationFlags || [],
      aiConfidenceNote: rawInsights.ai_confidence_note || rawInsights.aiConfidenceNote || '',
      disclaimer: rawInsights.disclaimer || 'Clinical Decision Support Tool only.'
    };

    // Save assessment record
    const assessment = await MedicationAssessment.create({
      assessmentId,
      patient: patient._id,
      patientSnapshot: {
        patientId: patient.patientId,
        fullName: patient.fullName,
        age: patient.age,
        sex: patient.sex,
        weight: patient.weight,
        allergies: patient.allergies,
        conditions: patient.conditions
      },
      medicationsSnapshot: medications.map(m => ({
        genericName: m.genericName,
        brandName: m.brandName,
        dosage: m.dosage,
        frequency: m.frequency,
        route: m.route,
        drugClass: m.drugClass,
        status: m.status
      })),
      interactionsDetected: formattedInteractions,
      duplicatesDetected: formattedDuplicates,
      riskAnalysis: formattedRisk,
      aiInsights: formattedInsights,
      clinicianChecklist: formattedChecklist,
      networkGraph: analysisResult.network_graph || { totalNodes: medications.length, totalEdges: formattedInteractions.length },
      conductedBy: req.user._id
    });

    // Update patient record
    patient.riskStatus = formattedRisk.riskLevel;
    patient.lastRiskScore = formattedRisk.score;
    patient.lastEvaluatedAt = new Date();
    await patient.save();

    // Trigger Notification for Clinical Team if High or Moderate Risk
    if (formattedRisk.riskLevel === 'High Risk' || formattedRisk.riskLevel === 'Moderate Risk') {
      await Notification.create({
        recipient: null, // broadcast to all clinical users
        title: `${formattedRisk.riskLevel.toUpperCase()}: ${patient.fullName} (${patient.patientId})`,
        message: `Safety assessment flagged ${formattedInteractions.length} interaction(s) and ${formattedDuplicates.length} duplication(s). Risk Score: ${formattedRisk.score}/100.`,
        type: formattedRisk.riskLevel === 'High Risk' ? 'alert' : 'warning',
        priority: formattedRisk.riskLevel === 'High Risk' ? 'High' : 'Moderate',
        relatedPatient: patient._id,
        relatedAssessment: assessment._id
      });
    }

    await logAudit(
      req,
      'ASSESSMENT_RUN',
      'Assessment',
      assessment._id,
      `Conducted polypharmacy evaluation for ${patient.fullName}. Result: ${formattedRisk.riskLevel} (${formattedRisk.score}/100)`
    );

    res.status(201).json({
      success: true,
      message: 'Medication polypharmacy evaluation completed.',
      assessment
    });
  } catch (err) {
    next(err);
  }
};

exports.getPatientAssessments = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const assessments = await MedicationAssessment.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .populate('conductedBy', 'name role department');

    res.status(200).json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (err) {
    next(err);
  }
};

exports.getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await MedicationAssessment.findById(req.params.id)
      .populate('patient')
      .populate('conductedBy', 'name role department');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment record not found' });
    }

    res.status(200).json({
      success: true,
      assessment
    });
  } catch (err) {
    next(err);
  }
};

exports.downloadAssessmentPDF = async (req, res, next) => {
  try {
    const assessment = await MedicationAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment record not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="PharmaFog_Report_${assessment.assessmentId}.pdf"`);

    await logAudit(req, 'REPORT_DOWNLOADED', 'Assessment', assessment._id, `Downloaded PDF report ${assessment.assessmentId}`);

    PDFService.generateAssessmentPDF(assessment, res);
  } catch (err) {
    next(err);
  }
};

exports.updateChecklistItem = async (req, res, next) => {
  try {
    const { assessmentId, itemId } = req.params;
    const { completed } = req.body;

    const assessment = await MedicationAssessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const item = assessment.clinicianChecklist.find(c => c.id === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found' });
    }

    item.completed = completed !== undefined ? completed : !item.completed;
    item.completedAt = item.completed ? new Date() : null;
    item.completedBy = item.completed ? req.user.name : null;

    await assessment.save();
    res.status(200).json({ success: true, message: 'Checklist updated', checklist: assessment.clinicianChecklist });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalPatients = await Patient.countDocuments({});
    const highRiskCount = await Patient.countDocuments({ riskStatus: 'High Risk' });
    const moderateRiskCount = await Patient.countDocuments({ riskStatus: 'Moderate Risk' });
    const lowRiskCount = await Patient.countDocuments({ riskStatus: 'Low Risk' });
    const unevaluatedCount = await Patient.countDocuments({ riskStatus: 'Not Evaluated' });

    const underReviewCount = highRiskCount + moderateRiskCount;
    const totalMedications = await Medication.countDocuments({ status: 'Active' });

    // Count interactions detected across latest assessments
    const latestAssessments = await MedicationAssessment.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('patient', 'fullName patientId riskStatus');

    let totalInteractionsAlerts = 0;
    latestAssessments.forEach(a => {
      totalInteractionsAlerts += (a.interactionsDetected ? a.interactionsDetected.length : 0);
    });

    const recentActivity = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(8);

    const riskDistribution = [
      { name: 'High Risk', count: highRiskCount, color: '#ef4444' },
      { name: 'Moderate Risk', count: moderateRiskCount, color: '#f59e0b' },
      { name: 'Low Risk', count: lowRiskCount, color: '#10b981' },
      { name: 'Not Evaluated', count: unevaluatedCount, color: '#94a3b8' }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        underReviewCount,
        totalMedications,
        totalInteractionsAlerts,
        highRiskCount,
        riskDistribution
      },
      recentAssessments: latestAssessments,
      recentActivity
    });
  } catch (err) {
    next(err);
  }
};
