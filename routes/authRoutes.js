const express = require('express');
const router = express.Router();
const { getToken } = require('../controllers/authController');
const { createCompositionHook } = require('../controllers/createCompositionHook');
const { compositionCallBack } = require('../controllers/compositionCallBack');
const { listCompositions } = require('../controllers/listCompositions');
const { compositionById } = require('../controllers/compositioById');
const { downloadComposition } = require('../controllers/downloadComposition');
const { listCompositionHooks } = require('../controllers/listCompositionHooks');
const { deleteCompositionHook } = require('../controllers/deleteCompositionHook ');

// Crear un nuevo hook de composición
router.post('/create-composition-hook', createCompositionHook);

// Activa el hook Se hace Post en blanco)
router.post('/getToken', getToken);

// Callback donde Twilio envía la información de la composición
router.post('/composition-callback', compositionCallBack);

// Listar todas las composiciones
router.get('/list-compositions', listCompositions);

// Obtener una composición por su SID
router.get('/compositions/:sid', compositionById);

// Descargar una composición por su SID
router.get('/compositions/:sid/download', downloadComposition); 

// Listar todos los hooks de composición
router.get('/hook-list', listCompositionHooks);

// Eliminar un hook de composición por su SID
router.delete('/composition-hook/:hookSid', deleteCompositionHook);

module.exports = router;