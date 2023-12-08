const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');
const { route } = require('./consumidor.router');

router.get('/:id/productos', pedidoController.obtenerProductos);
router.post('/', pedidoController.agregar);
router.put('/:id/entregado', pedidoController.estadoEntregado);
router.put('/:id/cancelar', pedidoController.cancelar);

module.exports = router;