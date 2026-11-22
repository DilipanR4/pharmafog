const Medication = require('../models/Medication');
const Patient = require('../models/Patient');
const MedicationReference = require('../models/MedicationReference');
const { logAudit } = require('../middleware/auditLogger');

exports.getPatientMedications = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const medications = await Medication.find({ patient: patientId }).sort({ status: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medications.length,
      medications
    });
  } catch (err) {
    next(err);
  }
};

exports.addMedication = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const {
      genericName,
      brandName,
      activeIngredient,
      drugClass,
      dosage,
      frequency,
      route,
      duration,
      startDate,
      status,
      prescribedBy,
      notes
    } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (!genericName || !dosage || !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Generic name, dosage, and frequency are required.'
      });
    }

    // Auto-fill active ingredient and drug class from reference database if omitted
    let finalActive = activeIngredient;
    let finalClass = drugClass;
    if (!finalActive || !finalClass) {
      const ref = await MedicationReference.findOne({
        $or: [
          { genericName: { $regex: new RegExp(`^${genericName}$`, 'i') } },
          { brandNames: { $regex: new RegExp(`^${genericName}$`, 'i') } }
        ]
      });
      if (ref) {
        if (!finalActive) finalActive = ref.activeIngredient;
        if (!finalClass) finalClass = ref.drugClass;
      }
    }

    const medication = await Medication.create({
      patient: patient._id,
      genericName: genericName.trim(),
      brandName: brandName ? brandName.trim() : '',
      activeIngredient: finalActive || genericName.trim(),
      drugClass: finalClass || 'General',
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      route: route || 'Oral',
      duration: duration || 'Ongoing',
      startDate: startDate || Date.now(),
      status: status || 'Active',
      prescribedBy: prescribedBy || req.user.name || 'Attending Clinician',
      notes: notes || ''
    });

    patient.updatedAt = new Date();
    await patient.save();

    await logAudit(req, 'MEDICATION_ADDED', 'Medication', medication._id, `Added ${medication.genericName} (${medication.dosage}) for patient ${patient.fullName}`);

    res.status(201).json({
      success: true,
      message: 'Medication added to patient regimen.',
      medication
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication record not found' });
    }

    const fields = [
      'genericName', 'brandName', 'activeIngredient', 'drugClass',
      'dosage', 'frequency', 'route', 'duration', 'startDate',
      'endDate', 'status', 'prescribedBy', 'notes'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        medication[f] = req.body[f];
      }
    });

    await medication.save();
    await logAudit(req, 'MEDICATION_UPDATED', 'Medication', medication._id, `Updated ${medication.genericName}`);

    res.status(200).json({
      success: true,
      message: 'Medication details updated.',
      medication
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication record not found' });
    }

    await medication.deleteOne();
    await logAudit(req, 'MEDICATION_DELETED', 'Medication', req.params.id, `Removed medication ${medication.genericName}`);

    res.status(200).json({
      success: true,
      message: 'Medication removed from regimen.'
    });
  } catch (err) {
    next(err);
  }
};

exports.searchReferenceMedications = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      const topMeds = await MedicationReference.find({}).limit(15);
      return res.status(200).json({ success: true, count: topMeds.length, medications: topMeds });
    }

    const regex = new RegExp(q, 'i');
    const matches = await MedicationReference.find({
      $or: [
        { genericName: regex },
        { brandNames: regex },
        { drugClass: regex },
        { activeIngredient: regex }
      ]
    }).limit(10);

    res.status(200).json({
      success: true,
      count: matches.length,
      medications: matches
    });
  } catch (err) {
    next(err);
  }
};
