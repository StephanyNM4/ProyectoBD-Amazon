const express = require('express');
const router = express.Router();
const vendedorController = require('../controllers/vendedores.controller')

// -Login vendedor
router.post('/login', vendedorController.login);

// -Agregar vendedor que regrese el id para el agregar de la tarjeta 
        //--------crear la tarjeta, el vendedor y la empresa
router.post('/agregar', vendedorController.agregarVendedor);

// -Agregar tarjeta bancaria
router.post('/:id/agregarTarjeta/', vendedorController.agregarTarjetaBancaria);

// -Obtener tarjeta bancaria por id vendedor
router.get('/:id/tarjetaBancaria', vendedorController.obtenerTarjetasBancaria);

// -Consulta obtener todos los tipo de cuenta
router.get('/tiposCuenta', vendedorController.obtenerTiposCuenta);

// -Consulta obtener tipo cuenta que retorne id tipo cuenta
router.get('/tipoCuenta/:id', vendedorController.obtenerTipoCuenta);

// -Consulta obtener todos los tipo de propietarios
router.get('/tiposPropietarios', vendedorController.obtenerTiposPropietarios);

// -Consulta obtener tipo propietario que retorne id tipo Propietario
router.get('/tipoPropietario/:id', vendedorController.obtenerTipoPropietarios);

// -Consulta para obtener el total de las ventas de la fecha actual
router.get('/:id/totalFechaActual', vendedorController.obtenerTotalActualPorFecha);

// -Ganancias del dia de hoy con un where feche=sysdate
router.get('/:id/totalGanancias', vendedorController.obtenerTotalGanancias);


module.exports=router;