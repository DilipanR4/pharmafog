const MedicationReference = require('../models/MedicationReference');
const DrugInteraction = require('../models/DrugInteraction');
const InteractionEngine = require('../services/interactionEngine');
const { logAudit } = require('../middleware/auditLogger');

exports.getAllMedicationReferences = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const query = {};

    if (q) {
      const reg = new RegExp(q, 'i');
      query.$or = [{ genericName: reg }, { brandNames: reg }, { activeIngredient: reg }, { drugClass: reg }];
    }
    if (category) {
      query.therapeuticCategory = category;
    }

    const medications = await MedicationReference.find(query).sort({ genericName: 1 });
    res.status(200).json({ success: true, count: medications.length, medications });
  } catch (err) {
    next(err);
  }
};

exports.addMedicationReference = async (req, res, next) => {
  try {
    const { referenceId, genericName, brandNames, drugClass, therapeuticCategory, activeIngredient, commonUsage, typicalDosage, route, beersCriteria, monitoringParameters } = req.body;

    if (!genericName || !drugClass || !activeIngredient) {
      return res.status(400).json({ success: false, message: 'genericName, drugClass, and activeIngredient are required.' });
    }

    const refId = referenceId || `RXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRef = await MedicationReference.create({
      referenceId: refId,
      genericName,
      brandNames: Array.isArray(brandNames) ? brandNames : (brandNames ? brandNames.split(',').map(s => s.trim()) : []),
      drugClass,
      therapeuticCategory: therapeuticCategory || 'General',
      activeIngredient,
      commonUsage: commonUsage || '',
      typicalDosage: typicalDosage || '',
      route: route || 'Oral',
      beersCriteria: Boolean(beersCriteria),
      monitoringParameters: Array.isArray(monitoringParameters) ? monitoringParameters : (monitoringParameters ? monitoringParameters.split(',').map(s => s.trim()) : []),
      isDemo: true
    });

    await logAudit(req, 'REFERENCE_MED_ADDED', 'Reference', newRef._id, `Added reference drug ${newRef.genericName}`);
    res.status(201).json({ success: true, message: 'Reference medication created.', medication: newRef });
  } catch (err) {
    next(err);
  }
};

exports.getAllDrugInteractions = async (req, res, next) => {
  try {
    const { q, severity } = req.query;
    const query = {};

    if (q) {
      const reg = new RegExp(q, 'i');
      query.$or = [{ medicationA: reg }, { medicationB: reg }, { mechanism: reg }];
    }
    if (severity && severity !== 'All') {
      query.severity = severity;
    }

    const interactions = await DrugInteraction.find(query).sort({ severity: 1, medicationA: 1 });
    res.status(200).json({ success: true, count: interactions.length, interactions });
  } catch (err) {
    next(err);
  }
};

exports.addDrugInteraction = async (req, res, next) => {
  try {
    const { medicationA, medicationB, severity, mechanism, clinicalEffect, recommendation, source, category } = req.body;

    if (!medicationA || !medicationB || !severity || !mechanism || !clinicalEffect || !recommendation) {
      return res.status(400).json({ success: false, message: 'All interaction fields are required.' });
    }

    const newInter = await DrugInteraction.create({
      medicationA,
      medicationB,
      severity,
      mechanism,
      clinicalEffect,
      recommendation,
      source: source || 'PharmaFog Clinical Reference',
      category: category || 'Pharmacological Interaction',
      referenceStatus: 'Verified Clinical Reference'
    });

    await logAudit(req, 'INTERACTION_RULE_ADDED', 'Reference', newInter._id, `Added interaction rule ${medicationA} + ${medicationB}`);
    res.status(201).json({ success: true, message: 'Drug interaction rule saved.', interaction: newInter });
  } catch (err) {
    next(err);
  }
};

exports.checkDirectInteractions = async (req, res, next) => {
  try {
    const { medications } = req.body;
    if (!medications || !Array.isArray(medications) || medications.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 medications to check for potential interactions.'
      });
    }

    const formattedMeds = medications.map(m => typeof m === 'string' ? { genericName: m, name: m } : m);
    const interactions = await InteractionEngine.detectInteractions(formattedMeds);
    const duplicates = InteractionEngine.detectDuplicates(formattedMeds);

    res.status(200).json({
      success: true,
      totalChecked: formattedMeds.length,
      interactionsFound: interactions.length,
      duplicatesFound: duplicates.length,
      interactions,
      duplicates
    });
  } catch (err) {
    next(err);
  }
};
