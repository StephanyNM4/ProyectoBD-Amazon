const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//routers
const consumidoresRouter = require('./routes/consumidor.router')
const categoriasRouter = require('./routes/categoria.router')
const productosRouter = require('./routes/producto.router')


app.use('/consumidores', consumidoresRouter);
app.use('/categorias', categoriasRouter);
app.use('/productos', productosRouter);


app.get('/', (req, res) => {
    res.send("Servidor levantado correctamente");
})

app.listen(port, () => {
    console.log(`Servidor levantado en el puerto: ${port}`);
})