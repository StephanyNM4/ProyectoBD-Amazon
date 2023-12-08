const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller')

// -Consultar productos de una categoria
router.get('/categorias/:id', productoController.obtenerProductosPorCat);

// - Consultar keyword por nombre
router.get('/keyword/nombre/:keyword', productoController.obtenerIdKeywordPorNombre);

// -Consultar producto en oferta*
router.get('/ofertas', productoController.obtenerProductosEnOferta);

// -Consultar producto por nombre
router.get('/:nombre', productoController.obtenerProductosPorNombre);

// -Consultar producto por id
router.get('/obtenerUno/:id', productoController.obtenerUno);

module.exports=router;