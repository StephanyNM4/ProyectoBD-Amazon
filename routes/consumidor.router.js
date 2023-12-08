const express = require('express');
const router = express.Router();
const consumidorController = require('../controllers/consumidor.controller')

router.get('/', consumidorController.obtenerTodos);
router.get('/:id', consumidorController.obtenerUno);
router.post('/', consumidorController.agregar);
router.put('/:id', consumidorController.actualizar);
router.post('/login', consumidorController.login);
router.get('/:idConsumidor/pedidos/estado/:idEstado', consumidorController.pedidoEstado);
router.get('/:id/direcciones', consumidorController.obtenerDirecciones);

module.exports=router;