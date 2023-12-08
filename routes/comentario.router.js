const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentario.controller');

router.get('/producto/:id', comentarioController.obtenerComentariosProducto);
router.post('/',comentarioController.agregar );

module.exports=router;