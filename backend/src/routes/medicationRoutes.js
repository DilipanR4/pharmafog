const express = require('express');
const router = express.Router();
const {
  getPatientMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  searchReferenceMedications
} = require('../controllers/medicationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/search', searchReferenceMedications);
router.get('/patient/:patientId', getPatientMedications);
router.post('/patient/:patientId', addMedication);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);

module.exports = router;
