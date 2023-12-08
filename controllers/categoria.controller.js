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

module.exports = categoriaController;