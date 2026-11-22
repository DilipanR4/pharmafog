const express = require('express');
const router = express.Router();
const {
  getAllMedicationReferences,
  addMedicationReference,
  getAllDrugInteractions,
  addDrugInteraction,
  checkDirectInteractions
} = require('../controllers/referenceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/medications', getAllMedicationReferences);
router.post('/medications', authorize('Admin'), addMedicationReference);

router.get('/interactions', getAllDrugInteractions);
router.post('/interactions', authorize('Admin'), addDrugInteraction);

router.post('/check', checkDirectInteractions);

module.exports = router;
