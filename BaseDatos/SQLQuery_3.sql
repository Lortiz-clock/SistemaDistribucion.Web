-- ============================================================
-- BODEGAS: CONSULTAR (solo activas)
-- ============================================================
CREATE PROCEDURE Usp_Bodegas_Consultar
AS
BEGIN
    SELECT CodigoBodega, Nombre, Tipo, Estado
    FROM tbl_Bodegas
    WHERE Estado = 1;
END
GO

-- ============================================================
-- BODEGAS: BUSCAR POR CÓDIGO
-- ============================================================
CREATE PROCEDURE Usp_Bodegas_Buscar
    @CodigoBodega INT
AS
BEGIN
    SELECT CodigoBodega, Nombre, Tipo, Estado
    FROM tbl_Bodegas
    WHERE CodigoBodega = @CodigoBodega AND Estado = 1;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('No se encontró la bodega solicitada.', 16, 1);
    END
END
GO

-- ============================================================
-- BODEGAS: AGREGAR
-- ============================================================
CREATE PROCEDURE Usp_Bodegas_Agregar
    @Nombre NVARCHAR(100),
    @Tipo   NVARCHAR(50) = NULL
AS
BEGIN
    INSERT INTO tbl_Bodegas (Nombre, Tipo, Estado)
    VALUES (@Nombre, @Tipo, 1);

    SELECT
        1 AS exito,
        'Bodega agregada correctamente.' AS mensaje,
        SCOPE_IDENTITY() AS codigoBodega;
END
GO

-- ============================================================
-- BODEGAS: EDITAR
-- ============================================================
CREATE PROCEDURE Usp_Bodegas_Editar
    @CodigoBodega INT,
    @Nombre       NVARCHAR(100),
    @Tipo         NVARCHAR(50) = NULL
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tbl_Bodegas WHERE CodigoBodega = @CodigoBodega AND Estado = 1)
    BEGIN
        RAISERROR('No se encontró la bodega solicitada.', 16, 1);
        RETURN;
    END

    UPDATE tbl_Bodegas
    SET Nombre = @Nombre, Tipo = @Tipo
    WHERE CodigoBodega = @CodigoBodega;

    SELECT 1 AS exito, 'Bodega actualizada correctamente.' AS mensaje;
END
GO

-- ============================================================
-- BODEGAS: ELIMINAR (LÓGICO)
-- ============================================================
CREATE PROCEDURE Usp_Bodegas_Eliminar
    @CodigoBodega INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tbl_Bodegas WHERE CodigoBodega = @CodigoBodega AND Estado = 1)
    BEGIN
        RAISERROR('No se encontró la bodega solicitada.', 16, 1);
        RETURN;
    END

    UPDATE tbl_Bodegas
    SET Estado = 0
    WHERE CodigoBodega = @CodigoBodega;

    SELECT 1 AS exito, 'Bodega eliminada correctamente.' AS mensaje;
END
GO

-- ============================================================
-- PRODUCTO_BODEGA: CONSULTAR STOCK (todo, con nombre de producto y bodega)
-- ============================================================
CREATE PROCEDURE Usp_ProductoBodega_Consultar
AS
BEGIN
    SELECT
        pb.CodigoProducto,
        p.Nombre AS NombreProducto,
        pb.CodigoBodega,
        b.Nombre AS NombreBodega,
        pb.StockActual,
        pb.Estado
    FROM tbl_ProductoBodega pb
    INNER JOIN tbl_Productos p ON p.CodigoProducto = pb.CodigoProducto
    INNER JOIN tbl_Bodegas b ON b.CodigoBodega = pb.CodigoBodega
    WHERE pb.Estado = 1;
END
GO

-- ============================================================
-- PRODUCTO_BODEGA: CONSULTAR STOCK DE UN PRODUCTO ESPECÍFICO (en todas las bodegas)
-- ============================================================
CREATE PROCEDURE Usp_ProductoBodega_BuscarPorProducto
    @CodigoProducto INT
AS
BEGIN
    SELECT
        pb.CodigoProducto,
        p.Nombre AS NombreProducto,
        pb.CodigoBodega,
        b.Nombre AS NombreBodega,
        pb.StockActual,
        pb.Estado
    FROM tbl_ProductoBodega pb
    INNER JOIN tbl_Productos p ON p.CodigoProducto = pb.CodigoProducto
    INNER JOIN tbl_Bodegas b ON b.CodigoBodega = pb.CodigoBodega
    WHERE pb.CodigoProducto = @CodigoProducto AND pb.Estado = 1;
END
GO

-- ============================================================
-- PRODUCTO_BODEGA: ASIGNAR/INICIALIZAR STOCK (crea el registro si no existe)
-- ============================================================
CREATE PROCEDURE Usp_ProductoBodega_Agregar
    @CodigoProducto INT,
    @CodigoBodega   INT,
    @StockActual    INT = 0
AS
BEGIN
    IF EXISTS (SELECT 1 FROM tbl_ProductoBodega WHERE CodigoProducto = @CodigoProducto AND CodigoBodega = @CodigoBodega)
    BEGIN
        RAISERROR('Ya existe un registro de stock para ese producto en esa bodega.', 16, 1);
        RETURN;
    END

    INSERT INTO tbl_ProductoBodega (CodigoProducto, CodigoBodega, StockActual, Estado)
    VALUES (@CodigoProducto, @CodigoBodega, @StockActual, 1);

    SELECT 1 AS exito, 'Stock inicial registrado correctamente.' AS mensaje;
END
GO

-- ============================================================
-- PRODUCTO_BODEGA: ACTUALIZAR STOCK (ej. entradas/salidas manuales)
-- ============================================================
CREATE PROCEDURE Usp_ProductoBodega_ActualizarStock
    @CodigoProducto INT,
    @CodigoBodega   INT,
    @StockActual    INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tbl_ProductoBodega WHERE CodigoProducto = @CodigoProducto AND CodigoBodega = @CodigoBodega AND Estado = 1)
    BEGIN
        RAISERROR('No existe registro de stock para ese producto en esa bodega.', 16, 1);
        RETURN;
    END

    UPDATE tbl_ProductoBodega
    SET StockActual = @StockActual
    WHERE CodigoProducto = @CodigoProducto AND CodigoBodega = @CodigoBodega;

    SELECT 1 AS exito, 'Stock actualizado correctamente.' AS mensaje;
END
GO

-- ============================================================
-- PRODUCTO_BODEGA: ELIMINAR (LÓGICO)
-- ============================================================
CREATE PROCEDURE Usp_ProductoBodega_Eliminar
    @CodigoProducto INT,
    @CodigoBodega   INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tbl_ProductoBodega WHERE CodigoProducto = @CodigoProducto AND CodigoBodega = @CodigoBodega AND Estado = 1)
    BEGIN
        RAISERROR('No existe registro de stock para ese producto en esa bodega.', 16, 1);
        RETURN;
    END

    UPDATE tbl_ProductoBodega
    SET Estado = 0
    WHERE CodigoProducto = @CodigoProducto AND CodigoBodega = @CodigoBodega;

    SELECT 1 AS exito, 'Registro eliminado correctamente.' AS mensaje;
END
GO