const express = require('express');
const router = express.Router();
const { getToken } = require('../controllers/authController');

// Definir la ruta POST /getToken
router.post('/getToken', getToken);

module.exports = router;