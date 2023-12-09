const ventaController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');

ventaController.actualizar = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `
        UPDATE TBL_PRODUCTOS_EN_VENTA
            SET PRECIO = :NPRECIO, CANTIDAD = :NCANTIDAD, DESCUENTO = :NDESCUENTO
            WHERE ID_PRODUCTO = ${req.params.id}
        `;

        //Objeto consumidor
        const binds = {
            NPRECIO: req.body.PRECIO, 
            NCANTIDAD: req.body.CANTIDAD, 
            NDESCUENTO: req.body.DESCUENTO
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);
        await connection.close();

        if (result.rowsAffected && result.rowsAffected === 1) {
            res.send({exito:true, mensaje:"Venta modificada correctamente"});
        }else{
            res.send({exito:false, mensaje:"Error al modificar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

ventaController.obtenerProductosVentaVendedor = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * 
                            FROM TBL_PRODUCTOS_EN_VENTA
                            WHERE ID_VENDEDOR = ${req.params.id} `;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);

        // Cerrar la conexión después de obtener los datos
        await connection.close(); 

        // Enviar los datos
        res.send(result.rows); 

    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}


ventaController.agregarProductoEnVenta = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `INSERT INTO TBL_PRODUCTOS_EN_VENTA ( ID_PRODUCTO, ID_VENDEDOR, ID_ESTADO, SKU, PRECIO, CANTIDAD, DESCUENTO) 
                            VALUES (:ID_PRODUCTO, :ID_VENDEDOR, :ID_ESTADO, :SKU, :PRECIO, :CANTIDAD, :DESCUENTO)
                            RETURNING ID_PRODUCTO INTO :out`;

        //Objeto imagen para producto
        const binds = {
            ID_PRODUCTO: req.body.ID_PRODUCTO,
            ID_VENDEDOR: req.body.ID_VENDEDOR,
            ID_ESTADO: req.body.ID_ESTADO,
            SKU: req.body.SKU,
            PRECIO: req.body.PRECIO,
            CANTIDAD: req.body.CANTIDAD,
            DESCUENTO: req.body.DESCUENTO,
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);
        await connection.close();

        if (result.rowsAffected && result.rowsAffected === 1) {
            res.send({exito:true, mensaje:"Venta nueva agregado correctamente"});
        }else{
            res.send({exito:false, mensaje:"Error al agregar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}



module.exports = ventaController;