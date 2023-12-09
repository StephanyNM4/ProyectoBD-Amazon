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
router.post('/agregar', productoController.agregar);

//--------------Faltan :c

// -Agregar producto por keyword
// router.post('/agregarPorKeyword', productoController.agregarKeywordPorProducto);

// --Insert de productos con atributos especificos(tablas de herencia)
// router.post('/atributosEspecificos', productoController.agregarProductos);

// (si existe al crear el producto no se ocupa llenar los campos generales si no existe 
// hacer el insert en la general de productos )
// -Si el producto ya existe solo mandar campos de la tabla productos en venta
// router.post('/agregarVerificar', productoController.agregarVerificar);








module.exports=router;