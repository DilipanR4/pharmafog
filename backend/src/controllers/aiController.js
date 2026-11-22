const Patient = require('../models/Patient');
const Medication = require('../models/Medication');
const AIService = require('../services/aiService');

exports.askPatientAI = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a clinical inquiry.' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    const medications = await Medication.find({ patient: patient._id, status: 'Active' });

    const response = await AIService.askQuestion(question.trim(), patient, medications);

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (err) {
    next(err);
  }
};
