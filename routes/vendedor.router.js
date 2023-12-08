const express = require('express');
const router = express.Router();
const vendedorController = require('../controllers/vendedores.controller')

// -Login vendedor
router.post('/login', vendedorController.login);

// -Obtener mensajes de un vendedor

// -Insert empresa (que regrese id empresa creada para el insert del vendedor)
router.post('/agregarEmpresa', vendedorController.agregarEmpresa);

// -Agregar vendedor que regrese el id para el agregar de la tarjeta 
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



// -Consulta para obtener los lugares padre
router.get('/lugaresPadre', vendedorController.obtenerLugaresPadre);

// -Obtener lugares hijos
router.get('/lugarPadre/:id/lugarHijo', vendedorController.obtenerLugarHijo);






module.exports=router;