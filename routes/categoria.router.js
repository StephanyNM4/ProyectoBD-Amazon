const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller')

// - Consultar Categorias (categoria padre is null)
router.get('/productosPadre', categoriaController.obtenerCategoriasXPadre);

// -Consultar Categorias de las categorias padre (where categoria padre = categoria padre seleccionada)
router.get('/productosHijas/:id', categoriaController.obtenerCategorias);

// -Consulta para obtener los lugares padre
router.get('/lugaresPadre', categoriaController.obtenerLugaresPadre);

// -Obtener lugares hijos
router.get('/lugarPadre/:id/lugarHijo', categoriaController.obtenerLugarHijo);



module.exports=router;