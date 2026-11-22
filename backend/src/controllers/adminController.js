const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Patient = require('../models/Patient');
const Medication = require('../models/Medication');
const MedicationAssessment = require('../models/MedicationAssessment');
const DrugInteraction = require('../models/DrugInteraction');
const MedicationReference = require('../models/MedicationReference');
const { logAudit } = require('../middleware/auditLogger');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Administrators cannot deactivate their own active session.' });
    }

    user.active = !user.active;
    await user.save();

    await logAudit(req, 'USER_STATUS_TOGGLED', 'User', user._id, `Toggled active status of ${user.email} to ${user.active}`);

    res.status(200).json({ success: true, message: `User status updated to ${user.active ? 'Active' : 'Inactive'}`, user });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Doctor', 'Pharmacist'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    await logAudit(req, 'USER_ROLE_UPDATED', 'User', user._id, `Updated role of ${user.email} to ${role}`);

    res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
  } catch (err) {
    next(err);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const query = {};
    if (action) query.action = action;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email role');

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (err) {
    next(err);
  }
};

exports.getSystemStatus = async (req, res, next) => {
  try {
    const mongoState = mongoose.connection.readyState;
    const mongoStatusMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };

    let mlStatus = 'Unavailable';
    let mlDetails = null;
    try {
      const mlRes = await axios.get(`${process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'}/api/health`, { timeout: 2000 });
      if (mlRes.data && mlRes.data.status === 'healthy') {
        mlStatus = 'Online (FastAPI)';
        mlDetails = mlRes.data;
      }
    } catch (e) {
      mlStatus = 'Offline (Native Fallback Active)';
    }

    const patientCount = await Patient.countDocuments({});
    const medicationCount = await Medication.countDocuments({});
    const assessmentCount = await MedicationAssessment.countDocuments({});
    const referenceCount = await MedicationReference.countDocuments({});
    const interactionCount = await DrugInteraction.countDocuments({});
    const userCount = await User.countDocuments({});

    const memUsage = process.memoryUsage();

    res.status(200).json({
      success: true,
      system: {
        serverTime: new Date(),
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsageMB: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
        },
        services: {
          database: {
            name: 'MongoDB',
            status: mongoStatusMap[mongoState] || 'Unknown',
            connected: mongoState === 1
          },
          mlEngine: {
            name: 'PharmaFog ML Microservice',
            url: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
            status: mlStatus,
            details: mlDetails
          }
        },
        dataCounts: {
          patients: patientCount,
          medications: medicationCount,
          assessments: assessmentCount,
          referenceMedications: referenceCount,
          interactionRules: interactionCount,
          users: userCount
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
