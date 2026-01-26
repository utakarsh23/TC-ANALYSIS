const express = require('express');
const { codeGen, getJobStatus } = require('../Controllers/SubmitController');

const router = express.Router();

// POST /api/submit - Submit code for execution
router.post('/submit', codeGen);

// GET /api/status/:jobId - Get job status and results
router.get('/status/:jobId', getJobStatus);

module.exports = router;
