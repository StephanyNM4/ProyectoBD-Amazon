const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller')

// - Consultar Categorias (categoria padre is null)
router.get('/categoriasPadre', categoriaController.obtenerCategoriasXPadre);

// -Consultar Categorias de las categorias padre (where categoria padre = categoria padre seleccionada)
router.get('/categoriasHijas/:id', categoriaController.obtenerCategorias);


module.exports=router;