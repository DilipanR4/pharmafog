const express = require('express');
const router = express.Router();
const { askPatientAI } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/patient/:patientId/ask', askPatientAI);

module.exports = router;
