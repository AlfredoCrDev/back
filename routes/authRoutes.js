const express = require('express');
const router = express.Router();
const { getToken } = require('../controllers/authController');

// Definir la ruta GET y POST /getToken
router.get('/getToken', getToken);
router.post('/getToken', getToken);

module.exports = router;