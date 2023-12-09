const categoriaController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');


categoriaController.obtenerCategoriasXPadre = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * 
                            FROM TBL_CATEGORIAS_PRODUCTOS
                            WHERE ID_CATEGORIA_PADRE IS NULL `;

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

categoriaController.obtenerCategorias = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT * 
                        FROM TBL_CATEGORIAS_PRODUCTOS A,
                                TBL_CATEGORIAS_PRODUCTOS B
                        WHERE A.ID_CATEGORIA_PADRE = ${req.params.id}`;

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


//SELECT TODOS
categoriaController.obtenerLugaresPadre = async (req, res) => {
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

categoriaController.obtenerLugarHijo  = async (req, res) => {
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

module.exports = categoriaController;