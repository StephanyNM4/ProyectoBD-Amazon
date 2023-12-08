const express = require('express');
const router = express.Router();
const direccionController = require('../controllers/direccion.controller');

router.post('/', direccionController.agregar);
router.put('/:id', direccionController.actualizar);
router.get('/:id', direccionController.obtenerUna);

module.exports=router;