const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller')

// -Consultar productos de una categoria
router.get('/categorias/:id', productoController.obtenerProductosPorCat);

// - Consultar productos por keyword
router.get('/keyword/nombre/:keyword', productoController.obtenerIdKeywordPorNombre);

// -Consultar producto en oferta*
router.get('/ofertas', productoController.obtenerProductosEnOferta);

// -Consultar producto por nombre
router.get('/:nombre', productoController.obtenerProductosPorNombre);

// -Consultar producto por id
router.get('/obtenerUno/:id', productoController.obtenerUno);

// -Agregar imagen por producto
router.post('/:id/agregarImagen', productoController.agregarImagen);

// -Agregar producto 
router.post('/agregar/vendedor/:idVendedor', productoController.agregar);

// -Agregar producto por keyword
router.post('/agregarPorKeyword', productoController.agregarKeywordPorProducto);

module.exports=router;