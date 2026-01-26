const express = require('express');
const { codeGen } = require('../Controllers/SubmitController');

const router = express.Router();

// POST /api/submit - Submit code for execution
router.post('/submit', codeGen);

module.exports = router;
