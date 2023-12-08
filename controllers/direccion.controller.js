const direccionController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');

direccionController.agregar = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `INSERT INTO TBL_DIRECCIONES_CONSUMIDOR (id_consumidor, id_lugar, costo_envio) VALUES (:idConsumidor, :idLugar, :costo)`;

        //Objeto consumidor
        const binds = {
            idConsumidor: req.body.idConsumidor,
            idLugar: req.body.idLugar,
            costo: req.body.costo,
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

direccionController.actualizar = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `UPDATE TBL_DIRECCIONES_CONSUMIDOR
        SET id_lugar = :nuevoLugar, costo_envio = :nuevoCosto
        WHERE ID_DIRECCION_CONSUMIDOR = :idDireccion`;

        //Objeto consumidor
        const binds = {
            nuevoLugar: req.body.lugar,
            nuevoCosto: req.body.costo,
            idDireccion: req.params.id
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);
        await connection.close();

        if (result.rowsAffected && result.rowsAffected === 1) {
            res.send({exito:true, mensaje:"Direccion modificada correctamente"});
        }else{
            res.send({exito:false, mensaje:"Error al modificar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

direccionController.obtenerUna = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * FROM TBL_DIRECCIONES_CONSUMIDOR
        WHERE ID_DIRECCION_CONSUMIDOR = ${req.params.id}`;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);
        const data = result.rows[0];

        // Cerrar la conexión después de obtener los datos
        await connection.close(); 

        if(data == null){
            res.send({exito: false, mensaje: "No se encontró direccion"});
        }else{
            res.send({exito: true, direccion: data});
        }
    
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}


module.exports = direccionController; 