const consumidorController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');


//SELECT TODOS
consumidorController.obtenerTodos = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * FROM TBL_CONSUMIDORES`;

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

consumidorController.obtenerUno  = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * FROM TBL_CONSUMIDORES
        WHERE ID_CONSUMIDOR = ${req.params.id}`;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);
        const data = result.rows[0];

        // Cerrar la conexión después de obtener los datos
        await connection.close(); 

        // Enviar los datos
        res.json(data); 

    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

consumidorController.agregar = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `INSERT INTO TBL_CONSUMIDORES (nombre, correo, contrasena, numero_telefonico) 
        VALUES (:nombre, :correo, :contrasena, :numTelefono)
        RETURNING ID_CONSUMIDOR INTO :out`;

        //Objeto consumidor
        const binds = {
            nombre: req.body.nombre,
            correo: req.body.correo,
            contrasena: req.body.contrasena,
            numTelefono: req.body.numTelefono,
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);

        if (result.rowsAffected && result.rowsAffected === 1) {
            const idConsumidor = result.outBinds.out[0];
            console.log(idConsumidor);
            await connection.close();
            res.send("insertado correctamente");
        }else{
            res.send("No se pudo insertar");
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

consumidorController.actualizar = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `UPDATE TBL_CONSUMIDORES 
        SET nombre = :nuevoNombre, correo = :nuevoCorreo, contrasena = :nuevaContrasena, numero_telefonico = :nuevoNumTelefono
        WHERE ID_CONSUMIDOR = :idConsumidor`;

        //Objeto consumidor
        const binds = {
            nuevoNombre: req.body.nombre,
            nuevoCorreo: req.body.correo,
            nuevaContrasena: req.body.contrasena,
            nuevoNumTelefono: req.body.numTelefono,
            idConsumidor: req.params.id
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);
        await connection.close();

        if (result.rowsAffected && result.rowsAffected === 1) {
            res.send("Consumidor modificado correctamente");
        }else{
            res.send("Error al modificar");
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

module.exports = consumidorController;