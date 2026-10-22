-- ============================================================
-- AJUSTE DE INVENTARIO CON HISTORIAL
-- Antes de correr: verificar columnas de tbl_ProductosBodega
--   SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
--   WHERE TABLE_NAME = 'tbl_ProductosBodega';
-- Se asume: CodigoProducto, CodigoBodega, StockActual (INT)
-- ============================================================

select * from tbl_DetalleCompra;

   SELECT OBJECT_DEFINITION(OBJECT_ID('Usp_Inventario_Consultar'));

SELECT name FROM sys.procedures WHERE name LIKE '%Inventario%';
-- 1. Tabla de historial
IF OBJECT_ID('dbo.tbl_AjusteInventario') IS NULL
BEGIN
    CREATE TABLE tbl_AjusteInventario (
        CodigoAjuste   INT IDENTITY(1,1) PRIMARY KEY,
        CodigoProducto INT NOT NULL,
        CodigoBodega   INT NOT NULL,
        TipoAjuste     VARCHAR(10) NOT NULL,
        Cantidad       INT NOT NULL,
        StockAnterior  INT NOT NULL,
        StockNuevo     INT NOT NULL,
        Motivo         VARCHAR(255) NOT NULL,
        CodigoUsuario  INT NULL,
        FechaAjuste    DATETIME2 NOT NULL CONSTRAINT DF_AjusteInventario_Fecha DEFAULT SYSDATETIME(),
        CONSTRAINT CK_AjusteInventario_Tipo CHECK (TipoAjuste IN ('Descuento', 'Incremento')),
        CONSTRAINT CK_AjusteInventario_Cantidad CHECK (Cantidad > 0),
        CONSTRAINT FK_AjusteInventario_Producto FOREIGN KEY (CodigoProducto) REFERENCES tbl_Productos(CodigoProducto),
        CONSTRAINT FK_AjusteInventario_Bodega FOREIGN KEY (CodigoBodega) REFERENCES tbl_Bodegas(CodigoBodega),
        CONSTRAINT FK_AjusteInventario_Usuario FOREIGN KEY (CodigoUsuario) REFERENCES tbl_Usuarios(CodigoUsuario)
    );
END
GO

-- 2. Ajustar stock + registrar historial (una sola transacción)
CREATE OR ALTER PROCEDURE Usp_Inventario_Ajustar
    @CodigoProducto INT,
    @CodigoBodega INT,
    @TipoAjuste VARCHAR(10),
    @Cantidad INT,
    @Motivo VARCHAR(255),
    @CodigoUsuario INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
            IF LTRIM(RTRIM(ISNULL(@Motivo, ''))) = ''
                THROW 50002, 'El motivo del ajuste es obligatorio.', 1;

            IF @TipoAjuste NOT IN ('Descuento', 'Incremento')
                THROW 50003, 'El tipo de ajuste debe ser Descuento o Incremento.', 1;

            IF @Cantidad <= 0
                THROW 50004, 'La cantidad debe ser mayor a cero.', 1;

            DECLARE @StockAnterior INT;

            SELECT @StockAnterior = StockActual
            FROM tbl_ProductosBodega WITH (UPDLOCK, ROWLOCK)
            WHERE CodigoProducto = @CodigoProducto
              AND CodigoBodega = @CodigoBodega;

            IF @StockAnterior IS NULL
                THROW 50001, 'No existe inventario de ese producto en esa bodega.', 1;

            DECLARE @StockNuevo INT =
                CASE WHEN @TipoAjuste = 'Descuento'
                     THEN @StockAnterior - @Cantidad
                     ELSE @StockAnterior + @Cantidad END;

            IF @StockNuevo < 0
                THROW 50005, 'Stock insuficiente: el descuento es mayor al stock actual.', 1;

            UPDATE tbl_ProductosBodega
            SET StockActual = @StockNuevo
            WHERE CodigoProducto = @CodigoProducto
              AND CodigoBodega = @CodigoBodega;

            INSERT INTO tbl_AjusteInventario
                (CodigoProducto, CodigoBodega, TipoAjuste, Cantidad,
                 StockAnterior, StockNuevo, Motivo, CodigoUsuario)
            VALUES
                (@CodigoProducto, @CodigoBodega, @TipoAjuste, @Cantidad,
                 @StockAnterior, @StockNuevo, LTRIM(RTRIM(@Motivo)), @CodigoUsuario);

            COMMIT TRANSACTION;

            SELECT 1 AS Exito, 'Ajuste registrado correctamente.' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @MensajeError NVARCHAR(2048);

        SET @MensajeError = CONCAT(
            'Procedimiento: ', COALESCE(ERROR_PROCEDURE(), OBJECT_NAME(@@PROCID)),
            ' | Línea: ', ERROR_LINE(),
            ' | Número: ', ERROR_NUMBER(),
            ' | Mensaje: ', ERROR_MESSAGE()
        );

        THROW 50000, @MensajeError, 1;
    END CATCH
END;
GO

-- 3. Consultar historial (todos o filtrado por producto / bodega)
CREATE OR ALTER PROCEDURE Usp_Inventario_HistorialConsultar
    @CodigoProducto INT = NULL,
    @CodigoBodega INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
            SELECT
                a.CodigoAjuste,
                p.Nombre        AS Producto,
                b.Nombre        AS Bodega,
                a.TipoAjuste,
                a.Cantidad,
                a.StockAnterior,
                a.StockNuevo,
                a.Motivo,
                u.NombreUsuario AS Usuario,
                a.FechaAjuste
            FROM tbl_AjusteInventario a
            INNER JOIN tbl_Productos p ON p.CodigoProducto = a.CodigoProducto
            INNER JOIN tbl_Bodegas b   ON b.CodigoBodega   = a.CodigoBodega
            LEFT JOIN tbl_Usuarios u   ON u.CodigoUsuario  = a.CodigoUsuario
            WHERE (@CodigoProducto IS NULL OR a.CodigoProducto = @CodigoProducto)
              AND (@CodigoBodega   IS NULL OR a.CodigoBodega   = @CodigoBodega)
            ORDER BY a.FechaAjuste DESC;
    END TRY
    BEGIN CATCH
        DECLARE @MensajeError NVARCHAR(2048);

        SET @MensajeError = CONCAT(
            'Procedimiento: ', COALESCE(ERROR_PROCEDURE(), OBJECT_NAME(@@PROCID)),
            ' | Línea: ', ERROR_LINE(),
            ' | Número: ', ERROR_NUMBER(),
            ' | Mensaje: ', ERROR_MESSAGE()
        );

        THROW 50000, @MensajeError, 1;
    END CATCH
END;
GO