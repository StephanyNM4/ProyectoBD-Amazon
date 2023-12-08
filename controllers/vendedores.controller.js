const vendedorController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');

vendedorController.login = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT A.ID_VENDEDOR,
                                    A.NOMBRE
                            FROM TBL_VENDEDORES A
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

vendedorController.agregarEmpresa = async (empresa) => {
    try {

        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `
                                Insert into
                                    TBL_EMPRESAS (ID_LUGAR, NOMBRE, NUMERO_REGISTRO)
                                VALUES
                                    (:ID_LUGAR, :NOMBRE, :NUM_REGISTRO)
                                RETURNING ID_EMPRESA INTO :out`;

        //Objeto empresa
        const binds = {
            ID_LUGAR: empresa.ID_LUGAR, 
            NOMBRE: empresa.NOMBRE, 
            NUM_REGISTRO: empresa.NUM_REGISTRO,
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);

        if (result.rowsAffected && result.rowsAffected === 1) {
            const idEmpresa = result.outBinds.out[0];
            await connection.close();
            return idEmpresa;
        } else {
            throw new Error("No se pudo insertar la empresa");
        }
    } catch (error) {

    }
}

//SELECT TODOS
vendedorController.obtenerTiposCuenta = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT A.*,
                                    B.NOMBRE AS "TIPO_LOGISITCA",
                                    B.COSTO
                                FROM
                                    TBL_TIPOS_CUENTAS A
                                    LEFT JOIN TBL_TIPO_LOGISTICA B ON A.ID_LOGISTICA = B.ID_LOGISTICA`;

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

vendedorController.obtenerTipoCuenta  = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * FROM TBL_TIPOS_CUENTAS
        WHERE ID_TIPO_CUENTA = ${req.params.id}`;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);
        const data = result.rows[0];

        // Cerrar la conexión después de obtener los datos
        await connection.close(); 

        if(data == null){
            res.send({exito: false, mensaje: "No se encontró tipo cuenta"});
        }else{
            res.send({exito: true, direccion: data});
        }

    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

//SELECT TODOS
vendedorController.obtenerLugaresPadre = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * 
                            FROM TBL_LUGARES A
                            INNER JOIN TBL_TIPOS_LUGARES B
                            ON A.ID_TIPO_LUGAR = B.ID_TIPO_LUGAR
                            WHERE ID_LUGAR_PADRE IS NULL `;

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

vendedorController.obtenerLugarHijo  = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * 
                            FROM TBL_LUGARES A
                            INNER JOIN TBL_TIPOS_LUGARES B
                            ON A.ID_TIPO_LUGAR = B.ID_TIPO_LUGAR
                            INNER JOIN TBL_LUGARES C
                            ON (A.ID_LUGAR_PADRE = ${req.params.id})`;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);
        const data = result.rows[0];

        // Cerrar la conexión después de obtener los datos
        await connection.close(); 

        if(data == null){
            res.send({exito: false, mensaje: "No se encontró lugar"});
        }else{
            res.send({exito: true, lugar: data});
        }

    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

vendedorController.agregarVendedor = async (req, res) => {
    try {

        //Agregar una nuevo vendedor
        const idEmpresa = await vendedorController.agregarEmpresa(req.body.empresa);
        console.log(idEmpresa);

        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `Insert into TBL_VENDEDORES	(ID_TIPO_CUENTA, ID_EMPRESA, ID_LUGAR_RESIDENCIA, ID_LUGAR_NACIMIENTO, PRIMER_NOMBRE, SEGUNDO_NOMBRE, APELLIDO, FECHA_NACIMIENTO, IDENTIFICACION, FECHA_INICIO_CUENTA, NUMERO_TELEFONICO)	
        VALUES	(:id_tipo_cuenta, :id_empresa, :id_lugar_residencia, :id_lugar_nacimiento, :primer_nombre, :segundo_nombre, :apellido, to_date(:fecha_nacimiento, 'DD-MM-YYYY') , :identificacion, sysdate , :numero_telefonico)
        RETURNING ID_VENDEDOR INTO :out`;

        //Objeto vendedor
        const binds = {
            id_tipo_cuenta: req.body.id_tipo_cuenta, 
            id_empresa: idEmpresa, 
            id_lugar_residencia: req.body.id_lugar_residencia, 
            id_lugar_nacimiento: req.body.id_lugar_nacimiento, 
            primer_nombre: req.body.primer_nombre, 
            segundo_nombre: req.body.segundo_nombre, 
            apellido: req.body.apellido, 
            fecha_nacimiento: req.body.fecha_nacimiento, 
            identificacion: req.body.identificacion, 
            numero_telefonico: req.body.numero_telefonico,
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);

        if (result.rowsAffected && result.rowsAffected === 1) {
            const idVendedor = result.outBinds.out[0];
            console.log(idVendedor);
            await connection.close();
            res.send({exito:true, mensaje:"insertado correctamente"});
        }else{
            res.send({exito:false, mensaje:"No se pudo insertar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

//SELECT TODOS
vendedorController.obtenerTiposPropietarios = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT *
                                FROM TBL_TIPOS_PROPIETARIOS`    ;

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

vendedorController.obtenerTipoPropietarios  = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT TIPO_PROPIETARIO FROM TBL_TIPOS_PROPIETARIOS
        WHERE ID_TIPO_PROPIETARIO = ${req.params.id}`;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);
        const data = result.rows[0];

        // Cerrar la conexión después de obtener los datos
        await connection.close(); 

        if(data == null){
            res.send({exito: false, mensaje: "No se encontró tipo propietario"});
        }else{
            res.send({data});
        }

    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}



vendedorController.agregarTarjetaBancaria = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `Insert into TBL_TARJETAS_BANCARIAS ( ID_TIPO_PROPIETARIO, ID_VENDEDOR, NUMERO_TARJETA, NOMBRE_PROPIETARIO, FECHA_VENCIMIENTO)	
        VALUES	(:id_tipo_propietario, :id_vendedor, :numero_tarjeta, :nombre_propietario, to_date(:fecha_vencimiento, 'DD-MM-YYYY') )
        RETURNING ID_TARJETA INTO :out`;

        //Objeto tarjeta bancaria
        const binds = {
            id_tipo_propietario: req.body.id_tipo_propietario,  
            id_vendedor: req.body.id_vendedor, 
            numero_tarjeta: req.body.numero_tarjeta, 
            nombre_propietario: req.body.nombre_propietario, 
            fecha_vencimiento: req.body.fecha_vencimiento,
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);

        if (result.rowsAffected && result.rowsAffected === 1) {
            const idTarjeta = result.outBinds.out[0];
            console.log(idTarjeta);
            await connection.close();
            res.send({exito:true, mensaje:"insertada correctamente"});
        }else{
            res.send({exito:false, mensaje:"No se pudo insertar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

//SELECT TODOS
vendedorController.obtenerTarjetasBancaria = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT *
                                FROM TBL_TARJETAS_BANCARIAS
                                WHERE ID_VENDEDOR = ${req.params.id}`    ;

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



module.exports = vendedorController;