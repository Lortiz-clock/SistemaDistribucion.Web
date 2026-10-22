-- ============================================================
-- PRODUCTOS: CONSULTAR (solo activos)
-- ============================================================
CREATE PROCEDURE Usp_Productos_Consultar
AS
BEGIN
    SELECT
        CodigoProducto,
        Codigo,
        Nombre,
        Costo,
        MargenMinimo,
        PrecioMinimo,
        FactorFardo,
        FactorMaster,
        StockMinimo,
        EsBonificable,
        Estado
    FROM tbl_Productos
    WHERE Estado = 1;
END
GO

-- ============================================================
-- PRODUCTOS: BUSCAR POR CÓDIGO
-- ============================================================
CREATE PROCEDURE Usp_Productos_Buscar
    @CodigoProducto INT
AS
BEGIN
    SELECT
        CodigoProducto,
        Codigo,
        Nombre,
        Costo,
        MargenMinimo,
        PrecioMinimo,
        FactorFardo,
        FactorMaster,
        StockMinimo,
        EsBonificable,
        Estado
    FROM tbl_Productos
    WHERE CodigoProducto = @CodigoProducto AND Estado = 1;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('No se encontró el producto solicitado.', 16, 1);
    END
END
GO

-- ============================================================
-- PRODUCTOS: AGREGAR
-- ============================================================
CREATE PROCEDURE Usp_Productos_Agregar
    @Codigo         NVARCHAR(50),
    @Nombre         NVARCHAR(150),
    @Costo          DECIMAL(12,2),
    @MargenMinimo   DECIMAL(5,2) = NULL,
    @PrecioMinimo   DECIMAL(12,2) = NULL,
    @FactorFardo    INT = NULL,
    @FactorMaster   INT = NULL,
    @StockMinimo    INT = 0,
    @EsBonificable  BIT = 0
AS
BEGIN
    IF EXISTS (SELECT 1 FROM tbl_Productos WHERE Codigo = @Codigo)
    BEGIN
        RAISERROR('Ya existe un producto con ese código.', 16, 1);
        RETURN;
    END

    INSERT INTO tbl_Productos
        (Codigo, Nombre, Costo, MargenMinimo, PrecioMinimo, FactorFardo, FactorMaster, StockMinimo, EsBonificable, Estado)
    VALUES
        (@Codigo, @Nombre, @Costo, @MargenMinimo, @PrecioMinimo, @FactorFardo, @FactorMaster, @StockMinimo, @EsBonificable, 1);

    SELECT
        1 AS exito,
        'Producto agregado correctamente.' AS mensaje,
        SCOPE_IDENTITY() AS codigoProducto;
END
GO

-- ============================================================
-- PRODUCTOS: EDITAR
-- ============================================================
CREATE PROCEDURE Usp_Productos_Editar
    @CodigoProducto INT,
    @Codigo         NVARCHAR(50),
    @Nombre         NVARCHAR(150),
    @Costo          DECIMAL(12,2),
    @MargenMinimo   DECIMAL(5,2) = NULL,
    @PrecioMinimo   DECIMAL(12,2) = NULL,
    @FactorFardo    INT = NULL,
    @FactorMaster   INT = NULL,
    @StockMinimo    INT = 0,
    @EsBonificable  BIT = 0
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tbl_Productos WHERE CodigoProducto = @CodigoProducto AND Estado = 1)
    BEGIN
        RAISERROR('No se encontró el producto solicitado.', 16, 1);
        RETURN;
    END

    UPDATE tbl_Productos
    SET
        Codigo = @Codigo,
        Nombre = @Nombre,
        Costo = @Costo,
        MargenMinimo = @MargenMinimo,
        PrecioMinimo = @PrecioMinimo,
        FactorFardo = @FactorFardo,
        FactorMaster = @FactorMaster,
        StockMinimo = @StockMinimo,
        EsBonificable = @EsBonificable
    WHERE CodigoProducto = @CodigoProducto;

    SELECT 1 AS exito, 'Producto actualizado correctamente.' AS mensaje;
END
GO

-- ============================================================
-- PRODUCTOS: ELIMINAR (LÓGICO)
-- ============================================================
CREATE PROCEDURE Usp_Productos_Eliminar
    @CodigoProducto INT
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tbl_Productos WHERE CodigoProducto = @CodigoProducto AND Estado = 1)
    BEGIN
        RAISERROR('No se encontró el producto solicitado.', 16, 1);
        RETURN;
    END

    UPDATE tbl_Productos
    SET Estado = 0
    WHERE CodigoProducto = @CodigoProducto;

    SELECT 1 AS exito, 'Producto eliminado correctamente.' AS mensaje;
END
GO