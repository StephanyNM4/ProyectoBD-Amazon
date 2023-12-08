const express = require('express');
const router = express.Router();
const consumidorController = require('../controllers/consumidor.controller')

router.get('/', consumidorController.obtenerTodos);
router.get('/:id', consumidorController.obtenerUno);
router.post('/', consumidorController.agregar);
router.put('/:id', consumidorController.actualizar);

module.exports=router;