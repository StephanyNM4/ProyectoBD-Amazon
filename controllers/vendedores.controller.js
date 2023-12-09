const vendedorController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');

vendedorController.login = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT A.ID_VENDEDOR,
                            A.PRIMER_NOMBRE ||' '|| A.SEGUNDO_NOMBRE || ' '|| A.APELLIDO NOMBRE_COMPLETO
                            FROM TBL_VENDEDORES A
                            WHERE A.PRIMER_NOMBRE ||' '|| A.SEGUNDO_NOMBRE || ' '|| A.APELLIDO = '${req.body.nombreCompleto}'
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
            res.send({exito: false, mensaje: "nombre o contraseña incorrectos"})
        }else{
            res.json({exito: true, vendedor:data }); 
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

vendedorController.agregarVendedorYEmpresa = async (Vendedor) => {
    try {

        //Agregar una nuevo vendedor
        const idEmpresa = await vendedorController.agregarEmpresa(Vendedor.empresa);
        console.log(idEmpresa);

        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `Insert into TBL_VENDEDORES	(ID_TIPO_CUENTA, ID_EMPRESA, ID_LUGAR_RESIDENCIA, ID_LUGAR_NACIMIENTO, PRIMER_NOMBRE, SEGUNDO_NOMBRE, APELLIDO, FECHA_NACIMIENTO, IDENTIFICACION, FECHA_INICIO_CUENTA, NUMERO_TELEFONICO)	
        VALUES	(:id_tipo_cuenta, :id_empresa, :id_lugar_residencia, :id_lugar_nacimiento, :primer_nombre, :segundo_nombre, :apellido, to_date(:fecha_nacimiento, 'DD-MM-YYYY') , :identificacion, sysdate , :numero_telefonico)
        RETURNING ID_VENDEDOR INTO :out`;

        //Objeto vendedor
        const binds = {
            id_tipo_cuenta: Vendedor.id_tipo_cuenta, 
            id_empresa: idEmpresa, 
            id_lugar_residencia: Vendedor.id_lugar_residencia, 
            id_lugar_nacimiento: Vendedor.id_lugar_nacimiento, 
            primer_nombre: Vendedor.primer_nombre, 
            segundo_nombre: Vendedor.segundo_nombre, 
            apellido: Vendedor.apellido, 
            fecha_nacimiento: Vendedor.fecha_nacimiento, 
            identificacion: Vendedor.identificacion, 
            numero_telefonico: Vendedor.numero_telefonico,
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
            throw new Error("No se pudo insertar el vendedor");
        }
    } catch (error) {

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

vendedorController.agregarVendedor = async (req, res) => {
    try {
        //Agregar vendedor
        const idVendedor = await vendedorController.agregarVendedorYEmpresa(req.body.vendedor);
        console.log(idVendedor);

        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `Insert into TBL_TARJETAS_BANCARIAS ( ID_TIPO_PROPIETARIO, ID_VENDEDOR, NUMERO_TARJETA, NOMBRE_PROPIETARIO, FECHA_VENCIMIENTO)	
        VALUES	(:id_tipo_propietario, :id_vendedor, :numero_tarjeta, :nombre_propietario, to_date(:fecha_vencimiento, 'DD-MM-YYYY') )
        RETURNING ID_TARJETA INTO :out`;

        //Objeto tarjeta bancaria
        const binds = {
            id_tipo_propietario: 2,  
            id_vendedor: idVendedor, 
            numero_tarjeta: req.body.tarjetaBancaria.numero_tarjeta, 
            nombre_propietario: req.body.tarjetaBancaria.nombre_propietario, 
            fecha_vencimiento: req.body.tarjetaBancaria.fecha_vencimiento,
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


vendedorController.obtenerTotalActualPorFecha = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `WITH CTE AS (
            SELECT
                A.PRECIO,
                A.CANTIDAD,
                (A.PRECIO * A.CANTIDAD) AS SUBTOTAL
            FROM
                TBL_PRODUCTOS_PEDIDOS A
                LEFT JOIN TBL_PRODUCTOS_EN_VENTA B ON A.ID_PROD_VEND = B.ID_PROD_VEND
                LEFT JOIN TBL_PEDIDOS C ON A.ID_PEDIDO = C.ID_PEDIDO
            WHERE
                C.ID_ESTADO = 1 --ESTADO PENDIENTE
                AND B.ID_VENDEDOR = ${req.params.id}
                AND TRUNC(C.FECHA) = TRUNC(SYSDATE)
        )
        SELECT
            NVL(SUM(SUBTOTAL), 0) AS "TOTAL",
            (SUM(SUBTOTAL) * 0.15) AS "ISV"
        FROM
            CTE`;

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

vendedorController.obtenerTotalGanancias = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `WITH CTE AS (    
            SELECT A.PRECIO, A.CANTIDAD,
                      (A.PRECIO * A.CANTIDAD) AS SUBTOTAL
            FROM 
                TBL_PRODUCTOS_PEDIDOS A
            LEFT JOIN 
                TBL_PRODUCTOS_EN_VENTA B ON A.ID_PROD_VEND = B.ID_PROD_VEND
            LEFT JOIN 
                TBL_PEDIDOS C ON A.ID_PEDIDO = C.ID_PEDIDO
            WHERE 
                C.ID_ESTADO != 5 --diferente de estado cancelado 
            AND 
                B.ID_VENDEDOR = ${req.params.id}
        )
        SELECT  NVL(SUM(SUBTOTAL),0) AS "TOTAL",
                (SUM(SUBTOTAL)*0.15) AS "ISV"
        FROM CTE`;

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