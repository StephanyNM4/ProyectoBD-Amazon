const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//routers
const consumidoresRouter = require('./routes/consumidor.router');
const pedidosRouter = require('./routes/pedido.router');
const estadosRouter = require('./routes/estado.router');
const direccionesRouter = require('./routes/direccion.router');
const mensajesRouter = require('./routes/mensajes.router');

app.use('/consumidores', consumidoresRouter);
app.use('/pedidos', pedidosRouter);
app.use('/estados', estadosRouter);
app.use('/direcciones', direccionesRouter);
app.use('/mensajes', mensajesRouter);

app.get('/', (req, res) => {
    res.send("Servidor levantado correctamente");
})

app.listen(port, () => {
    console.log(`Servidor levantado en el puerto: ${port}`);
})