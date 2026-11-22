const express = require('express');
const router = express.Router();
const {
  runAssessment,
  getPatientAssessments,
  getAssessmentById,
  downloadAssessmentPDF,
  updateChecklistItem,
  getDashboardStats
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.post('/patient/:patientId', runAssessment);
router.get('/patient/:patientId', getPatientAssessments);
router.get('/:id', getAssessmentById);
router.get('/:id/pdf', downloadAssessmentPDF);
router.patch('/:assessmentId/checklist/:itemId', updateChecklistItem);

module.exports = router;
