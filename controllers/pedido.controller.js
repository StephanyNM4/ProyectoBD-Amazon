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

pedidoController.agregar = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        let total=0;
        let subtotal=0;
        let isv= 0;

        //Verificar que hay suficientes productos en el stock
        const productosEncontrados = [];
        let exito = true;
        await Promise.all(req.body.productos.map(async (prod) => {
            const secuenciaSQL = `SELECT ID_PROD_VEND,
                                    PRECIO,
                                    DESCUENTO,
                                    CANTIDAD
                                FROM TBL_PRODUCTOS_EN_VENTA 
                                WHERE ID_PROD_VEND = ${prod.id}`;

            const options = {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            };

            const result = await connection.execute(secuenciaSQL, [], options);
            const prodEncontrado = result.rows[0];

            if (prodEncontrado != null && prodEncontrado.CANTIDAD >= prod.cantidad) {
                prodEncontrado.CANTIDAD_VENTA = prod.cantidad;
                productosEncontrados.push(prodEncontrado);
            } else {
                exito = false;
            }
        }));

        //console.log(productosEncontrados);
        if (!exito) {
            res.send ({ exito: false, mensaje: "No se encontró un producto o no hay suficientes en el stock" });
        }else{
            //Atualizar stock
            await Promise.all(productosEncontrados.map(async (prod) => {
                const secuenciaSQL= `UPDATE TBL_PRODUCTOS_EN_VENTA
                SET cantidad = :nuevaCantidad
                WHERE ID_PROD_VEND = :idProducto`;

                //Objeto consumidor
                const binds = {
                    nuevaCantidad: prod.CANTIDAD - prod.CANTIDAD_VENTA,
                    idProducto: prod.ID_PROD_VEND
                };

                //para que haga el commit
                const options= {
                    autoCommit: true,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                };

                const result = await connection.execute(secuenciaSQL,binds,options);    
                if (result.rowsAffected != 1) {
                    exito = false;
                } 

                let sub = (prod.PRECIO * prod.CANTIDAD_VENTA);

                prod.SUBTOTAL = sub - (sub * prod.DESCUENTO);

                subtotal = subtotal + prod.SUBTOTAL;
            }));

            if(!exito){
                res.send ({ exito: false, mensaje: "No se pudo actualizar el stock" });
            }else{

                //console.log(productosEncontrados);
                //Crear pedido
                const secuenciaSQL= `INSERT INTO TBL_PEDIDOS (ID_DIRECCION_CONSUMIDOR,	ID_TARJETA_BANCARIA, ID_ESTADO,	FECHA, SUBTOTAL, ISV, TOTAL, FECHA_ENTREGA)	
                VALUES	(:idDireccionConsumidor, :idTarjetaBancaria, 1,	to_date(sysdate,'DD-MM-YYYY'), :subtotal, :isv, :total, to_date(sysdate + 7,'DD-MM-YYYY'))
                RETURNING ID_PEDIDO INTO :idPedido`;

                //Objeto consumidor
                const binds = {
                    idDireccionConsumidor: req.body.idDireccionConsumidor, 
                    idTarjetaBancaria: req.body.idTarjetaBancaria,
                    subtotal: subtotal.toFixed(2),
                    isv: subtotal *0.15,
                    total: subtotal + (subtotal * 0.15),
                    idPedido: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                };

                //para que haga el commit
                const options= {
                    autoCommit: true,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                };

                const result = await connection.execute(secuenciaSQL,binds,options);

                if (result.rowsAffected && result.rowsAffected === 1) {
                    const idPedido = result.outBinds.idPedido[0];

                    //Insertar productos x pedido
                    await Promise.all(productosEncontrados.map(async (prod) => {
                        const secuenciaSQL= `INSERT INTO TBL_PRODUCTOS_PEDIDOS (ID_PEDIDO, ID_PROD_VEND, CANTIDAD, PRECIO,	SUBTOTAL)	
                        VALUES	(:idPed, :idProdVend, :cantidad, :precio , :subtotal)`;
        
                        //Objeto consumidor
                        const binds = {
                            idPed: idPedido,
                            idProdVend: prod.ID_PROD_VEND,
                            cantidad: prod.CANTIDAD_VENTA,
                            precio: prod.PRECIO,
                            subtotal: prod.SUBTOTAL
                        };
        
                        //para que haga el commit
                        const options= {
                            autoCommit: true,
                            outFormat: oracledb.OUT_FORMAT_OBJECT
                        };
        
                        const result = await connection.execute(secuenciaSQL,binds,options);    
                        if (result.rowsAffected != 1) {
                            exito = false;
                        } 
                    }));

                    if(!exito){
                        res.send({exito:false, mensaje:"No se pudo hacer pedido, base de datos alterada"});
                    }else{
                        await connection.close();
                        res.send({exito:true, mensaje:"Pedido hecho correctamente"});
                    }


                }else{
                    
                }

            }
            
        }

    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

module.exports = pedidoController;