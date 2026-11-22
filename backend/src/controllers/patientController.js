const Patient = require('../models/Patient');
const Medication = require('../models/Medication');
const MedicationAssessment = require('../models/MedicationAssessment');
const { logAudit } = require('../middleware/auditLogger');

exports.getPatients = async (req, res, next) => {
  try {
    const { search, riskStatus, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { conditions: { $regex: search, $options: 'i' } }
      ];
    }

    if (riskStatus && riskStatus !== 'All') {
      query.riskStatus = riskStatus;
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('assignedDoctor', 'name email department');

    // Attach medication counts
    const patientIds = patients.map(p => p._id);
    const medCounts = await Medication.aggregate([
      { $match: { patient: { $in: patientIds }, status: 'Active' } },
      { $group: { _id: '$patient', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    medCounts.forEach(c => {
      countMap[String(c._id)] = c.count;
    });

    const enrichedPatients = patients.map(p => ({
      ...p.toObject(),
      activeMedicationsCount: countMap[String(p._id)] || 0
    }));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      patients: enrichedPatients
    });
  } catch (err) {
    next(err);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('assignedDoctor', 'name email department');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const medications = await Medication.find({ patient: patient._id }).sort({ status: 1, createdAt: -1 });
    const latestAssessment = await MedicationAssessment.findOne({ patient: patient._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      patient,
      medications,
      latestAssessment
    });
  } catch (err) {
    next(err);
  }
};

exports.createPatient = async (req, res, next) => {
  try {
    const { fullName, age, sex, weight, allergies, conditions, clinicalNotes } = req.body;

    if (!fullName || age === undefined) {
      return res.status(400).json({ success: false, message: 'Full name and age are required.' });
    }

    // Generate unique Patient ID
    const count = await Patient.countDocuments({});
    const patientId = `PF-${1000 + count + 1}`;

    const patient = await Patient.create({
      patientId,
      fullName,
      age: Number(age),
      sex: sex || 'Undisclosed',
      weight: weight ? Number(weight) : null,
      allergies: Array.isArray(allergies) ? allergies : (allergies ? allergies.split(',').map(s => s.trim()) : []),
      conditions: Array.isArray(conditions) ? conditions : (conditions ? conditions.split(',').map(s => s.trim()) : []),
      clinicalNotes: clinicalNotes || '',
      assignedDoctor: req.user._id,
      riskStatus: 'Not Evaluated'
    });

    await logAudit(req, 'PATIENT_CREATED', 'Patient', patient._id, `Created patient ${patient.fullName} (${patient.patientId})`);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      patient
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const { fullName, age, sex, weight, allergies, conditions, clinicalNotes } = req.body;
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (fullName) patient.fullName = fullName;
    if (age !== undefined) patient.age = Number(age);
    if (sex) patient.sex = sex;
    if (weight !== undefined) patient.weight = weight ? Number(weight) : null;
    if (allergies !== undefined) {
      patient.allergies = Array.isArray(allergies) ? allergies : allergies.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (conditions !== undefined) {
      patient.conditions = Array.isArray(conditions) ? conditions : conditions.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (clinicalNotes !== undefined) patient.clinicalNotes = clinicalNotes;

    await patient.save();
    await logAudit(req, 'PATIENT_UPDATED', 'Patient', patient._id, `Updated patient info for ${patient.fullName}`);

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully.',
      patient
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Cascade delete medications and assessments
    await Medication.deleteMany({ patient: patient._id });
    await MedicationAssessment.deleteMany({ patient: patient._id });
    await patient.deleteOne();

    await logAudit(req, 'PATIENT_DELETED', 'Patient', req.params.id, `Deleted patient record ${patient.fullName} (${patient.patientId})`);

    res.status(200).json({
      success: true,
      message: 'Patient record and associated medications removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};
