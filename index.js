const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


const consumidoresRouter = require('./routes/consumidor.router');
const pedidosRouter = require('./routes/pedido.router');
const estadosRouter = require('./routes/estado.router');
const direccionesRouter = require('./routes/direccion.router');
const vendedoresRouter = require('./routes/vendedor.router')
const ventasRouter = require('./routes/venta.router')
const mensajesRouter = require('./routes/mensajes.router')
const categoriasRouter = require('./routes/categoria.router')
const productosRouter = require('./routes/producto.router')
const comentariosRouter = require('./routes/comentario.router');


app.use('/consumidores', consumidoresRouter);
app.use('/categorias', categoriasRouter);
app.use('/productos', productosRouter);
app.use('/pedidos', pedidosRouter);
app.use('/estados', estadosRouter);
app.use('/direcciones', direccionesRouter);
app.use('/vendedores', vendedoresRouter);
app.use('/ventas', ventasRouter);
app.use('/comentarios', comentariosRouter);
app.use('/mensajes',mensajesRouter);


app.get('/', (req, res) => {
    res.send("Servidor levantado correctamente");
})

app.listen(port, () => {
    console.log(`Servidor levantado en el puerto: ${port}`);
})