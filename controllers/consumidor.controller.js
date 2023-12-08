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

consumidorController.login = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT A.ID_CONSUMIDOR,
                                    A.NOMBRE
                            FROM TBL_CONSUMIDORES A
                            WHERE A.CORREO = '${req.body.correo}'
                            AND CONTRASENA = '${req.body.contrasena}'`;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);
        const data = result.rows[0];

        // Cerrar la conexión después de obtener los datos
        await connection.close(); 

        if(data == null){
            res.send({exito: false, mensaje: "correo o contraseña incorrectos"})
        }else{
            res.json({exito: true, consumidor:data }); 
        }        

    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

consumidorController.pedidoEstado  = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT A.ID_PEDIDO,
                                    A.FECHA_ENTREGA,
                                    A.SUBTOTAL,
                                    A.ISV,
                                    A.TOTAL,
                                    D.LUGAR AS "LUGAR_DE_ENTREGA",
                                    SUBSTR(
                                        E.NUMERO_TARJETA,
                                        LENGTH(E.NUMERO_TARJETA) - 4,
                                        5
                                    ) AS "ULTIMOS_DIGITOS_TARJETA_USADA"
                                FROM TBL_PEDIDOS A
                                LEFT JOIN TBL_TARJETAS_BANCARIAS B 
                                ON (A.ID_TARJETA_BANCARIA = B.ID_TARJETA)
                                LEFT JOIN TBL_DIRECCIONES_CONSUMIDOR C 
                                ON (A.ID_DIRECCION_CONSUMIDOR = C.ID_DIRECCION_CONSUMIDOR)
                                LEFT JOIN TBL_LUGARES D 
                                ON (C.ID_LUGAR = D.ID_LUGAR)
                                LEFT JOIN TBL_TARJETAS_BANCARIAS E 
                                ON (A.ID_TARJETA_BANCARIA = E.ID_TARJETA)
                                WHERE B.ID_CONSUMIDOR = ${req.params.idConsumidor}
                                AND A.ID_ESTADO = ${req.params.idEstado}`;

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

consumidorController.obtenerDirecciones = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT A.ID_CONSUMIDOR, 
                                A.ID_DIRECCION_CONSUMIDOR , 
                                B.LUGAR  AS "DIRECCION",
                                B.ZIP,
                                A.COSTO_ENVIO
                            FROM TBL_DIRECCIONES_CONSUMIDOR A
                            LEFT JOIN TBL_LUGARES B  
                            ON (A.ID_LUGAR=B.ID_LUGAR)
                            WHERE 
                            A.ID_CONSUMIDOR = ${req.params.id}`;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);
        const data = result.rows;

        // Cerrar la conexión después de obtener los datos
        await connection.close(); 

        // Enviar los datos
        res.json(data); 

    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

module.exports = consumidorController;