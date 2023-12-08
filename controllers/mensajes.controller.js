const mensajesController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');

mensajesController.obtenerMensajesConsumidor = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * FROM TBL_MENSAJES 
                WHERE ID_CONSUMIDOR = ${req.params.id}`;

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

mensajesController.obtenerMensajesEnviadosConsumidor = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * FROM TBL_MENSAJES 
                WHERE ID_CONSUMIDOR = ${req.params.id}
                AND EMISOR= 'C'`;

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

mensajesController.obtenerConversacion = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * FROM TBL_MENSAJES 
                WHERE ID_CONSUMIDOR = ${req.body.idConsumidor}
                AND ID_VENDEDOR= ${req.body.idVendedor}`;

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

mensajesController.agregar = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);
        let bandera = true;

        if(req.body.idMensajePadre != null) {
            const secuenciaSQL= `UPDATE TBL_MENSAJES
            SET leido = 1
            WHERE ID_MENSAJE = ${req.body.idMensajePadre}`;

            const options= {
                autoCommit: true,
                outFormat: oracledb.OUT_FORMAT_OBJECT
            };
    
            const result1 = await connection.execute(secuenciaSQL,[],options);

            if (result1.rowsAffected && result1.rowsAffected === 1) {
                bandera=true;
            }else{
                bandera=false;
            }
        }

        if(bandera){
            //Secuencia sql 
            const secuenciaSQL= `INSERT INTO	TBL_MENSAJES (ID_VENDEDOR, ID_CONSUMIDOR, ID_MENSAJE_PADRE,	MENSAJE, EMISOR, LEIDO)	
            VALUES	(:idVendedor,	:idConsumidor,	:idMensajePadre, :mensaje, 	:emisor, 0)`;

            //Objeto consumidor
            const binds = {
                idVendedor: req.body.idVendedor,
                idConsumidor: req.body.idConsumidor,
                idMensajePadre: req.body.idMensajePadre,
                mensaje: req.body.mensaje,
                emisor: req.body.emisor
            };

            //para que haga el commit
            const options= {
                autoCommit: true,
                outFormat: oracledb.OUT_FORMAT_OBJECT
            };

            const result = await connection.execute(secuenciaSQL,binds,options);

            if (result.rowsAffected && result.rowsAffected === 1) {
                await connection.close();
                res.send({exito:true, mensaje:"Mensaje enviado correctamente"});
            }else{
                res.send({exito:false, mensaje:"No se pudo enviar"});
            }  
        }else{
            res.send({exito:false, mensaje:"Id de mensaje padre no existe"});
        }
        
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

module.exports = mensajesController;