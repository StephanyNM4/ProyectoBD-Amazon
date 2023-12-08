const pedidoController ={};
const oracledb = require('oracledb');
const dbConfig = require('../utils/dbconfig');

pedidoController.obtenerProductos = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `WITH CTE AS (
                                SELECT A.ID_PEDIDO, 
                                    D.NOMBRE AS PRODUCTO, 
                                    NVL(E.NOMBRE, 'SIN MARCA') AS MARCA, 
                                    B.CANTIDAD, 
                                    B.PRECIO, 
                                    B.SUBTOTAL, 
                                    F.SRC AS IMAGEN,
                                    ROW_NUMBER() OVER (PARTITION BY D.ID_PRODUCTO ORDER BY F.ID_IMAGEN) AS row_num
                                FROM TBL_PEDIDOS A
                                LEFT JOIN TBL_PRODUCTOS_PEDIDOS B 
                                ON (A.ID_PEDIDO = B.ID_PEDIDO)
                                LEFT JOIN TBL_PRODUCTOS_EN_VENTA C 
                                ON (B.ID_PROD_VEND = C.ID_PRODUCTO)
                                LEFT JOIN TBL_PRODUCTOS D 
                                ON (C.ID_PRODUCTO = D.ID_PRODUCTO)
                                LEFT JOIN TBL_MARCAS E 
                                ON (D.ID_MARCA = E.ID_MARCA)
                                LEFT JOIN TBL_IMAGENES F 
                                ON (D.ID_PRODUCTO = F.ID_PRODUCTO)
                                WHERE (A.ID_PEDIDO = ${req.params.id})
                            )
                            SELECT ID_PEDIDO, 
                                PRODUCTO, 
                                MARCA, 
                                CANTIDAD, 
                                PRECIO, 
                                SUBTOTAL, 
                                IMAGEN
                            FROM CTE 
                            WHERE (row_num = 1)
                            ORDER BY CANTIDAD`;

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







module.exports = pedidoController;