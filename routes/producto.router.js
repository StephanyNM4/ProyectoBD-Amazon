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


// Metodos:
// -Agregar imagen por producto
// -Update de productos en venta (precio, descuento, cantidad)
// -Obtener productos en venta x vendedor




// -Consulta productos por nombre 
// (si existe al crear el producto no se ocupa llenar los campos generales si no existe 
// hacer el insert en la general de productos )

// -Si el producto ya existe solo mandar campos de la tabla productos en venta

// --Insert de productos con atributos especificos(tablas de herencia)
// -Hacer el insert producto_en_venta
// -insert imagen x producto
// -insert producto(general) x keyword


module.exports=router;