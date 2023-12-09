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
        WHERE lower(KEYWORD) = lower('${keyword}')`;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);
        console.log(result.rows[0]);
        
        
        if(result.rows[0]!= undefined){
            const idKeyword = result.rows[0].ID_KEYWORD;
            //Secuencia sql 
            const secuenciaSQL1= `WITH CTE AS (
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
                    B.ID_KEYWORD = ${idKeyword} --AQUI SE INGRESA EL VALOR DE LAS KEYWORDS PARA BUSCAR
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

            const result1 = await connection.execute(secuenciaSQL1,[],options);

            // Cerrar la conexión después de obtener los datos
            await connection.close(); 

            // Enviar los datos
            res.send(result1.rows); 

        }else{
            res.send({exito:false, mensaje: "No existe keyword en la base de datos"});
        }

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

productoController.obtenerUno = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `SELECT
                            A.ID_PROD_VEND,
                            A.SKU,
                            A.CANTIDAD AS STOCK,
                            B.NOMBRE AS "PRODUCTO",
                            B.DESCRIPCION,
                            B.CALIFICACION,
                            B.DIMENSIONES,
                            B.CARACTERISTICA_ESPECIAL,
                            B.VINETAS,
                            B.AVISO_LEGAL,
                            NVL(C.NOMBRE, 'SIN MARCA') AS "MARCA",
                            A.PRECIO,
                            A.DESCUENTO,
                            D.ESTADO,
                            (E.PRIMER_NOMBRE || ' ' || E.APELLIDO) AS "VENDEDOR",
                            F.NOMBRE AS EMPRESA
                        FROM
                            TBL_PRODUCTOS_EN_VENTA A
                            LEFT JOIN TBL_PRODUCTOS B ON A.ID_PRODUCTO = B.ID_PRODUCTO
                            LEFT JOIN TBL_MARCAS C ON B.ID_MARCA = C.ID_MARCA
                            LEFT JOIN TBL_ESTADOS_PRODUCTOS D ON A.ID_ESTADO = D.ID_ESTADO
                            LEFT JOIN TBL_VENDEDORES E ON A.ID_VENDEDOR = E.ID_VENDEDOR
                            LEFT JOIN TBL_EMPRESAS F ON E.ID_EMPRESA = F.ID_EMPRESA
                        WHERE
                            A.ID_PROD_VEND = ${req.params.id}`;

        //para que devuelva en JSON los rows
        const options= {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        const result = await connection.execute(secuenciaSQL,[],options);
        const producto = result.rows[0];

        if(producto != null){
            const secuenciaSQL1= `SELECT
                                    A.ID_IMAGEN,
                                    A.SRC
                                FROM
                                    TBL_IMAGENES A
                                WHERE
                                    A.ID_PRODUCTO = ${req.params.id}`;

            const result1 = await connection.execute(secuenciaSQL1,[],options);
            const imagenes= result1.rows;

            const secuenciaSQL2= `SELECT A.ID_COMENTARIO,
                                    B.NOMBRE,
                                    A.CALIFICACION,
                                    A.ENCABEZADO,
                                    A.FECHA_PUBLICACION,
                                    A.COMENTARIO,
                                    A.UTIL
                            FROM TBL_COMENTARIOS A
                            INNER JOIN TBL_CONSUMIDORES B
                            ON(A.ID_CONSUMIDOR = B.ID_CONSUMIDOR)
                            WHERE ID_PRODUCTO = ${req.params.id}`;

            const result = await connection.execute(secuenciaSQL2,[],options);
            const comentarios= result.rows;
            await connection.close(); 
            
            res.send({producto, imagenes, comentarios});
        }else{
            res.send({exito:false, mensaje: "No existe producto"});
        }

    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

productoController.agregarImagen = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `INSERT INTO TBL_IMAGENES(ID_PRODUCTO,	SRC	)	
                            VALUES	(:ID_PRODUCTO, :SRC)
                            RETURNING ID_PRODUCTO INTO :out`;

        //Objeto imagen para producto
        const binds = {
            ID_PRODUCTO: req.params.id,	
            SRC: req.body.SRC,
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);
        await connection.close();

        if (result.rowsAffected && result.rowsAffected === 1) {
            res.send({exito:true, mensaje:"Imagen agregada correctamente"});
        }else{
            res.send({exito:false, mensaje:"Error al agregar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}


productoController.agregar = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);
        let banderaCrear= false;

        //Secuencia sql 
        const secuenciaSQL= `Insert into
        TBL_PRODUCTOS ( CALIFICACION, ID_CATEGORIA_PRODUCTO, ID_MARCA, DIMENSIONES, VINETAS, AVISO_LEGAL, CARACTERISTICA_ESPECIAL, NOMBRE, DESCRIPCION)
        VALUES (:calificacion, :idCategoria, :idMarca, :dimensiones, :vinetas, :avisoLegal, :caracteristaEspecial, :nombre, :descripcion)
        RETURNING ID_PRODUCTO INTO :out`;

        //Objeto imagen para producto
        const binds = {
            calificacion: req.body.productoCrear.calificacion,
            idCategoria: req.body.productoCrear.idCategoria,
            idMarca: req.body.productoCrear.idMarca,
            dimensiones: req.body.productoCrear.dimensiones,
            vinetas: req.body.productoCrear.vinetas,
            avisoLegal: req.body.productoCrear.avisoLegal,
            caracteristaEspecial: req.body.productoCrear.caracteristaEspecial,
            nombre: req.body.productoCrear.nombre,
            descripcion: req.body.productoCrear.descripcion,
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);
        if (result.rowsAffected && result.rowsAffected === 1) {

            const idProducto = result.outBinds.out[0];

            if(req.body.tipoProducto == "Pintura"){
                const secuenciaSQL1= `Insert into TBL_PINTURAS (ID_PRODUCTO, ID_TECNICA, ID_PINTOR	)	VALUES	(:idProd, :idTecnica, :idPintor)`;

                const binds1 = {
                    idProd: idProducto,
                    idTecnica: req.body.atributosAdicionales.idTecina,
                    idPintor: req.body.atributosAdicionales.idPintor,
                };

                const result1 = await connection.execute(secuenciaSQL1,binds1,options);

                if(result1.rowsAffected === 1){
                    banderaCrear=true;
                }
                
            }else if(req.body.tipoProducto == "Libro"){

                const secuenciaSQL2= `Insert into TBL_LIBROS (ID_PRODUCTO,	ID_EDITORIAL, ID_AUTOR,	CANTIDAD_PAGINAS, TITULO, FECHA_PUBLICACION	)	
                    VALUES (:idProd, :idEditorial, :idAutor, :cantidadPag, :titulo,	to_date(:fechaPublicacion, 'DD-MM-YYYY')) `;
                
                const binds2 = {
                    idProd: idProducto,
                    idEditorial: req.body.atributosAdicionales.idEditorial,
                    idAutor: req.body.atributosAdicionales.idAutor,
                    cantidadPag: req.body.atributosAdicionales.cantidadPag,
                    titulo: req.body.atributosAdicionales.titulo,
                    fechaPublicacion: req.body.atributosAdicionales.fechaPublicacion
                };

                const result2 = await connection.execute(secuenciaSQL2,binds2,options);

                if(result2.rowsAffected === 1){
                    banderaCrear=true;
                }

            }else if(req.body.tipoProducto == "Telefono"){

                const secuenciaSQL3= `Insert into TBL_TELEFONOS	(DESBLOQUEO_BIOMETRICO,	RESISTIBILIDAD_AGUA, ID_PROCESADOR, ID_SISTEMA_OPERATIVO, 
                ID_MEMORIA_RAM, ID_PRODUCTO, ID_MEMORIA_INTERNA, MODELO,BATERIA, ID_COLOR)	
                VALUES	(:desbloqueo, :resistibilidad, :idProcesador, :idSO, :idMemoriaRam,	:idProd, :idMemoriaInterna, :modelo, :bateria, :idColor)`;
                
                const binds3 = {
                    idProd: idProducto,
                    desbloqueo: req.body.atributosAdicionales.desbloqueo,
                    resistibilidad: req.body.atributosAdicionales.resistibilidad,
                    idProcesador: req.body.atributosAdicionales.idProcesador,
                    idSO: req.body.atributosAdicionales.idSO,
                    idMemoriaRam: req.body.atributosAdicionales.idMemoriaRam,
                    bateria: req.body.atributosAdicionales.bateria,
                    idMemoriaInterna: req.body.atributosAdicionales.idMemoriaInterna,
                    modelo: req.body.atributosAdicionales.modelo,
                    idColor: req.body.atributosAdicionales.idColor
                };

                const result3 = await connection.execute(secuenciaSQL3,binds3,options);

                if(result3.rowsAffected === 1){
                    banderaCrear=true;
                }

            }else if(req.body.tipoProducto == "Juguete"){
                const secuenciaSQL4= `Insert into TBL_JUGUETES ( ID_PRODUCTO, RANGO_EDAD, ID_COLOR ) VALUES	(:idProd, :rangoEdad, :idColor)`;

                const binds4 = {
                    idProd: idProducto,
                    rangoEdad: req.body.atributosAdicionales.rangoEdad,
                    idColor: req.body.atributosAdicionales.idColor,
                };

                const result4 = await connection.execute(secuenciaSQL4,binds4,options);

                if(result4.rowsAffected === 1){
                    banderaCrear=true;
                }
                
            }else if(req.body.tipoProducto == "Equipaje"){
                const secuenciaSQL5= `Insert into TBL_EQUIPAJES	( ID_PRODUCTO, RUEDAS, PESO_SOPORTADO ) VALUES ( :idProd, :ruedas,	:pesoSoportado)`;

                const binds5 = {
                    idProd: idProducto,
                    ruedas: req.body.atributosAdicionales.ruedas,
                    pesoSoportado: req.body.atributosAdicionales.pesoSoportado,
                };

                const result5 = await connection.execute(secuenciaSQL5,binds5,options);

                if(result5.rowsAffected === 1){
                    banderaCrear=true;
                }
                
            }

            if(banderaCrear){
                //insertar productos en venta
                const secuenciaSQL6= `INSERT INTO TBL_PRODUCTOS_EN_VENTA ( ID_PRODUCTO, ID_VENDEDOR, ID_ESTADO, SKU, PRECIO, CANTIDAD, DESCUENTO )	
                VALUES	(:idProd,	:idVendedor, :idEstado, :sku, :precio, :cantidad, :descuento)`;

                //Objeto imagen para producto
                const binds6 = {
                    idProd: idProducto,
                    idVendedor: req.params.idVendedor,
                    idEstado: req.body.productoVendedor.idEstado,
                    sku: req.body.productoVendedor.sku,
                    precio: req.body.productoVendedor.precio,
                    cantidad: req.body.productoVendedor.cantidad,
                    descuento: req.body.productoVendedor.descuento
                };

                const result6 = await connection.execute(secuenciaSQL6,binds6,options);
                if(result6.rowsAffected === 1){
                    res.send({exito:true, mensaje:"Producto insertado y agregado al vendedor correctamente"});
                }else{
                    res.send({exito:false, mensaje:"Error al agregar producto al vendedor"});
                }


            }else{
                res.send({exito:false, mensaje:"Error al agregar"});
            }
        }else{
            res.send({exito:false, mensaje:"Error al agregar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}


productoController.agregarKeywordPorProducto = async (req, res) => {
    try {

        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `INSERT INTO	TBL_KEYWORDS_PRODUCTOS	(	ID_PRODUCTO,	ID_KEYWORD	)	
                            VALUES	(	:ID_PRODUCTO,	:ID_KEYWORD	)
                            RETURNING ID_KEYWORD INTO :out`;

        //Objeto tarjeta bancaria
        const binds = {
            ID_PRODUCTO: req.body.ID_PRODUCTO,	
            ID_KEYWORD: req.body.ID_KEYWORD, 
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);

        if (result.rowsAffected && result.rowsAffected === 1) {
            await connection.close();
            res.send({exito:true, mensaje:"insertada correctamente"});
        }else{
            res.send({exito:false, mensaje:"No se pudo insertar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

productoController.agregarProductos = async (req, res) => {
    try {

        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `INSERT INTO	TBL_KEYWORDS_PRODUCTOS	(	ID_PRODUCTO,	ID_KEYWORD	)	
                            VALUES	(	:ID_PRODUCTO,	:ID_KEYWORD	)
                            RETURNING ID_KEYWORD INTO :out`;

        //Objeto tarjeta bancaria
        const binds = {
            ID_PRODUCTO: req.body.ID_PRODUCTO,	
            ID_KEYWORD: req.body.ID_KEYWORD, 
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        //para que haga el commit
        const options= {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        };

        const result = await connection.execute(secuenciaSQL,binds,options);

        if (result.rowsAffected && result.rowsAffected === 1) {
            await connection.close();
            res.send({exito:true, mensaje:"insertada correctamente"});
        }else{
            res.send({exito:false, mensaje:"No se pudo insertar"});
        }
    } catch (error) {

        res.status(500).send({ error: error.message }); 
    }
}

productoController.agregarKeywordPorProducto = async (req, res) => {
    try {
        //Hacemos la conexion
        const connection = await oracledb.getConnection(dbConfig);

        //Secuencia sql 
        const secuenciaSQL= `INSERT INTO	TBL_KEYWORDS_PRODUCTOS	(	ID_PRODUCTO, ID_KEYWORD	)	
                                VALUES	(	:ID_PRODUCTO,	:ID_KEYWORD	)
                                RETURNING ID_KEYWORD INTO :out`;

        //Objeto keyword - producto
        const binds = {
            ID_PRODUCTO: req.body.ID_PRODUCTO,
            ID_KEYWORD: req.body.ID_KEYWORD,
            out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
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




module.exports = productoController;


