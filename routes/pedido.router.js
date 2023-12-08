const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');
const { route } = require('./consumidor.router');

router.get('/:id/productos', pedidoController.obtenerProductos);
router.post('/', pedidoController.agregar);

module.exports = router;