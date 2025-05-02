const express = require('express');
const router = express.Router();
const { getToken } = require('../controllers/authController');
const { createCompositionHook } = require('./createCompositionHook');
const { compositionCallBack } = require('./compositionCallBack');

// Definir la ruta POST /getToken
router.post('/getToken', getToken);

router.post('/create-composition-hook', createCompositionHook)

router.post('/create-composition-hook', compositionCallBack);

module.exports = router;