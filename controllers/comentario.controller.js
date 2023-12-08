const comentarioController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');

comentarioController.obtenerComentariosProducto = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT A.ID_COMENTARIO,
                                    B.NOMBRE,
                                    A.CALIFICACION,
                                    A.ENCABEZADO,
                                    A.FECHA_PUBLICACION,
                                    A.COMENTARIO,
                                    A.UTIL
                            FROM TBL_COMENTARIOS A
                            INNER JOIN TBL_CONSUMIDORES B
                            ON(A.ID_CONSUMIDOR = B.ID_CONSUMIDOR)
                            WHERE ID_PRODUCTO = ${req.params.id}`;

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

comentarioController.agregar = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `INSERT INTO TBL_COMENTARIOS (ID_PRODUCTO, ID_CONSUMIDOR, CALIFICACION, ENCABEZADO, FECHA_PUBLICACION,	COMENTARIO,	UTIL)	
        VALUES	(	:idProducto,	:idConsumidor,	:calificacion,	:encabezado,	to_date(sysdate,'DD-MM-YYYY'), :comentario, :util)`;

        //Objeto consumidor
        const binds = {
            idProducto: req.body.idProducto,
            idConsumidor: req.body.idConsumidor,
            calificacion: req.body.calificacion,
            encabezado: req.body.encabezado,
            comentario: req.body.comentario,
            util: req.body.util
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);

        if (result.rowsAffected && result.rowsAffected === 1) {
            await connection.close();
            res.send({exito:true, mensaje:"insertado correctamente"});
        }else{
            res.send({exito:false, mensaje:"No se pudo insertar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

module.exports = comentarioController;