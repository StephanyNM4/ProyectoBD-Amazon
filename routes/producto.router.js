const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller')

// -Consultar productos de una categoria
router.get('/categorias/:id', productoController.obtenerProductosPorCat);

// - Consultar productos relacionados con los keywords
router.get('/keyword/:id', productoController.obtenerProductosPorKeywords);

// - Consultar keyword por nombre
router.get('/keyword/nombre/:keyword', productoController.obtenerIdKeywordPorNombre);

// -Consultar producto en oferta*
router.get('/ofertas', productoController.obtenerProductosEnOferta);

// -Consultar producto por nombre
router.get('/:nombre', productoController.obtenerProductosPorNombre);

module.exports=router;