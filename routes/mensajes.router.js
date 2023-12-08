const express = require('express');
const router = express.Router();
const mensajesController = require('../controllers/mensajes.controller');

router.get('/obtenerTodos/consumidor/:id', mensajesController.obtenerMensajesConsumidor);
router.get('/obtenerEnviados/consumidor/:id', mensajesController.obtenerMensajesEnviadosConsumidor);
router.get('/obtenerConversacion', mensajesController.obtenerConversacion);
router.post('/', mensajesController.agregar);

module.exports=router;