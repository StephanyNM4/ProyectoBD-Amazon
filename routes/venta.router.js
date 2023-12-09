const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventas.controller')



// Metodos:

// -Obtener productos en venta x vendedor
router.get('/productos/vendedor/:id', ventaController.obtenerProductosVentaVendedor);

// -Update de productos en venta (precio, descuento, cantidad)
router.put('/:id/actualizar', ventaController.actualizar);

// -Hacer el insert producto_en_venta
router.post('/agregar', ventaController.agregarProductoEnVenta);




module.exports=router;