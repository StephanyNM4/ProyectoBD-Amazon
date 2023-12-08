const express = require('express');
const router = express.Router();
const estadosController = require('../controllers/estados.controller');

router.get('/pedidos', estadosController.obtenerEstadosPedidos);

module.exports=router;