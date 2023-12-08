const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller')

router.get('/:id/productos', pedidoController.obtenerProductos);

module.exports = router;