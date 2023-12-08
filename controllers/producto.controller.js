const productoController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');


productoController.obtenerProductosPorCat = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `WITH CTE AS (
            SELECT
                A.ID_PROD_VEND,
                B.NOMBRE AS "PRODUCTO",
                A.PRECIO,
                A.DESCUENTO,
                D.ESTADO,
                C.NOMBRE AS "MARCA",
                E.SRC AS IMAGEN,
                ROW_NUMBER() OVER (
                    PARTITION BY A.ID_PROD_VEND
                    ORDER BY
                        E.ID_IMAGEN
                ) AS row_num
            FROM
                TBL_PRODUCTOS_EN_VENTA A
                LEFT JOIN TBL_PRODUCTOS B ON A.ID_PRODUCTO = B.ID_PRODUCTO
                LEFT JOIN TBL_MARCAS C ON B.ID_MARCA = C.ID_MARCA
                LEFT JOIN TBL_ESTADOS_PRODUCTOS D ON A.ID_ESTADO = D.ID_ESTADO
                LEFT JOIN TBL_IMAGENES E ON A.ID_PRODUCTO = E.ID_PRODUCTO
            WHERE
                B.ID_CATEGORIA_PRODUCTO = ${req.params.id}
        )
        SELECT
            ID_PROD_VEND,
            "PRODUCTO",
            PRECIO,
            DESCUENTO,
            ESTADO,
            "MARCA",
            "IMAGEN"
        FROM
            CTE
        WHERE
            row_num = 1`;

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

productoController.obtenerProductosPorKeywords = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `WITH CTE AS (
            SELECT
                DISTINCT A.NOMBRE AS "PRODUCTO",
                NVL(C.NOMBRE, 'SIN MARCA') AS "MARCA",
                D.ID_PROD_VEND,
                D.PRECIO,
                D.DESCUENTO,
                E.ESTADO,
                F.SRC AS "IMAGEN",
                ROW_NUMBER() OVER (
                    PARTITION BY D.ID_PROD_VEND
                    ORDER BY
                        F.ID_IMAGEN
                ) AS row_num
            FROM
                TBL_PRODUCTOS A
                LEFT JOIN TBL_KEYWORDS_PRODUCTOS B ON A.ID_PRODUCTO = B.ID_PRODUCTO
                LEFT JOIN TBL_MARCAS C ON A.ID_MARCA = C.ID_MARCA
                LEFT JOIN TBL_PRODUCTOS_EN_VENTA D ON A.ID_PRODUCTO = D.ID_PRODUCTO
                LEFT JOIN TBL_ESTADOS_PRODUCTOS E ON D.ID_ESTADO = E.ID_ESTADO
                LEFT JOIN TBL_IMAGENES F ON A.ID_PRODUCTO = F.ID_PRODUCTO
            WHERE
                B.ID_KEYWORD = ${req.params.id} --AQUI SE INGRESA EL VALOR DE LAS KEYWORDS PARA BUSCAR
        )
        SELECT
            "PRODUCTO",
            "MARCA",
            ID_PROD_VEND,
            PRECIO,
            DESCUENTO,
            ESTADO,
            "IMAGEN"
        FROM
            CTE
        WHERE
            row_num = 1`;

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

productoController.obtenerProductosPorNombre = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);
        const nombre = req.params.nombre;
        //Secuencia sql 
        const secuenciaSQL= `WITH CTE AS (
            SELECT
                A.ID_PRODUCTO,
                A.NOMBRE AS "NOMBRE_PRODUCTO",
                A.DESCRIPCION,
                B.NOMBRE AS "MARCA",
                A.DIMENSIONES,
                A.CARACTERISTICA_ESPECIAL,
                A.AVISO_LEGAL,
                C.SRC AS "IMAGEN",
                ROW_NUMBER() OVER (
                    PARTITION BY A.ID_PRODUCTO
                    ORDER BY
                        C.ID_IMAGEN
                ) AS row_num
            FROM
                TBL_PRODUCTOS A
                LEFT JOIN TBL_MARCAS B ON A.ID_MARCA = B.ID_MARCA
                LEFT JOIN TBL_IMAGENES C ON A.ID_PRODUCTO = C.ID_PRODUCTO
            WHERE
                LOWER(A.NOMBRE) LIKE LOWER('%${nombre}%') -- Devuelve todos los productos que contengan la cadena samsung en su nombre
        )
        SELECT
            ID_PRODUCTO,
            "NOMBRE_PRODUCTO",
            DESCRIPCION,
            "MARCA",
            DIMENSIONES,
            CARACTERISTICA_ESPECIAL,
            AVISO_LEGAL,
            "IMAGEN"
        FROM
            CTE
        WHERE
            row_num = 1`;

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

productoController.obtenerIdKeywordPorNombre = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);
        const keyword = req.params.keyword;
        //Secuencia sql 
        const secuenciaSQL= `SELECT ID_KEYWORD 
        FROM TBL_KEYWORDS
        WHERE KEYWORD = '${keyword}'`;

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

productoController.obtenerProductosEnOferta = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `WITH CTE AS (
            SELECT
                A.ID_PROD_VEND,
                B.NOMBRE,
                NVL(C.NOMBRE, 'SIN MARCA') AS "MARCA",
                A.DESCUENTO,
                D.SRC AS IMAGEN,
                ROW_NUMBER() OVER (
                    PARTITION BY A.ID_PROD_VEND
                    ORDER BY
                        D.ID_IMAGEN
                ) AS row_num
            FROM
                TBL_PRODUCTOS_EN_VENTA A
                LEFT JOIN TBL_PRODUCTOS B ON A.ID_PRODUCTO = B.ID_PRODUCTO
                LEFT JOIN TBL_MARCAS C ON B.ID_MARCA = C.ID_MARCA
                LEFT JOIN TBL_IMAGENES D ON A.ID_PRODUCTO = D.ID_PRODUCTO
            WHERE
                A.DESCUENTO > 0
        )
        SELECT
            ID_PROD_VEND,
            NOMBRE,
            "MARCA",
            DESCUENTO,
            IMAGEN
        FROM
            CTE
        WHERE
            row_num = 1`;

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

module.exports = productoController;

