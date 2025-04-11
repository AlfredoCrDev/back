const express = require('express');
const router = express.Router();
const { getToken } = require('../controllers/authController');

// Definir la ruta GET /getToken
router.get('/getToken', getToken);

module.exports = router;