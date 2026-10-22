-- ============================================================
-- AJUSTE DE INVENTARIO CON HISTORIAL (por lote)
-- tbl_ProductosBodega guarda el inventario por lote:
--   CodigoProductoBodega, CodigoProducto, CodigoBodega, CodigoDetalle,
--   Cantidad, FechaVencimiento, PrecioCosto, PrecioMinimo, PrecioSugerido, Estado
-- El ajuste se aplica a UN lote (CodigoProductoBodega) y queda en el historial.
-- No cambia la columna Estado.
-- ============================================================

-- 1. Tabla de historial
IF OBJECT_ID('dbo.tbl_AjusteInventario') IS NULL
BEGIN
    CREATE TABLE tbl_AjusteInventario (
        CodigoAjuste         INT IDENTITY(1,1) PRIMARY KEY,
        CodigoProductoBodega INT NOT NULL,   -- lote ajustado
        CodigoProducto       INT NOT NULL,
        CodigoBodega         INT NOT NULL,
        TipoAjuste           VARCHAR(10) NOT NULL,
        Cantidad             INT NOT NULL,
        CantidadAnterior     INT NOT NULL,
        CantidadNueva        INT NOT NULL,
        Motivo               VARCHAR(255) NOT NULL,
        CodigoUsuario        INT NULL,
        FechaAjuste          DATETIME2 NOT NULL CONSTRAINT DF_AjusteInventario_Fecha DEFAULT SYSDATETIME(),
        CONSTRAINT CK_AjusteInventario_Tipo CHECK (TipoAjuste IN ('Descuento', 'Incremento')),
        CONSTRAINT CK_AjusteInventario_Cantidad CHECK (Cantidad > 0),
        CONSTRAINT FK_AjusteInventario_Producto FOREIGN KEY (CodigoProducto) REFERENCES tbl_Productos(CodigoProducto),
        CONSTRAINT FK_AjusteInventario_Bodega FOREIGN KEY (CodigoBodega) REFERENCES tbl_Bodegas(CodigoBodega),
        CONSTRAINT FK_AjusteInventario_Usuario FOREIGN KEY (CodigoUsuario) REFERENCES tbl_Usuarios(CodigoUsuario)
    );
END
GO

-- 2. Lotes disponibles (para elegir cuál ajustar)
CREATE OR ALTER PROCEDURE Usp_Inventario_LotesConsultar
    @CodigoProducto INT = NULL,
    @CodigoBodega INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
            SELECT
                pb.CodigoProductoBodega,
                p.Nombre AS Producto,
                b.Nombre AS Bodega,
                pb.CodigoDetalle,
                pb.Cantidad,
                pb.FechaVencimiento,
                pb.PrecioCosto,
                pb.Estado
            FROM tbl_ProductosBodega pb
            INNER JOIN tbl_Productos p ON p.CodigoProducto = pb.CodigoProducto
            INNER JOIN tbl_Bodegas b   ON b.CodigoBodega   = pb.CodigoBodega
            WHERE (@CodigoProducto IS NULL OR pb.CodigoProducto = @CodigoProducto)
              AND (@CodigoBodega   IS NULL OR pb.CodigoBodega   = @CodigoBodega)
            ORDER BY p.Nombre, pb.FechaVencimiento;
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

-- 3. Ajustar un lote + registrar historial (una sola transacción)
CREATE OR ALTER PROCEDURE Usp_Inventario_Ajustar
    @CodigoProductoBodega INT,
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

            DECLARE @CantidadAnterior INT,
                    @CodigoProducto INT,
                    @CodigoBodega INT;

            SELECT @CantidadAnterior = Cantidad,
                   @CodigoProducto   = CodigoProducto,
                   @CodigoBodega     = CodigoBodega
            FROM tbl_ProductosBodega WITH (UPDLOCK, ROWLOCK)
            WHERE CodigoProductoBodega = @CodigoProductoBodega;

            IF @CantidadAnterior IS NULL
                THROW 50001, 'No se encontró el lote de inventario solicitado.', 1;

            DECLARE @CantidadNueva INT =
                CASE WHEN @TipoAjuste = 'Descuento'
                     THEN @CantidadAnterior - @Cantidad
                     ELSE @CantidadAnterior + @Cantidad END;

            IF @CantidadNueva < 0
                THROW 50005, 'Cantidad insuficiente: el descuento es mayor a lo disponible en el lote.', 1;

            UPDATE tbl_ProductosBodega
            SET Cantidad = @CantidadNueva
            WHERE CodigoProductoBodega = @CodigoProductoBodega;

            INSERT INTO tbl_AjusteInventario
                (CodigoProductoBodega, CodigoProducto, CodigoBodega, TipoAjuste, Cantidad,
                 CantidadAnterior, CantidadNueva, Motivo, CodigoUsuario)
            VALUES
                (@CodigoProductoBodega, @CodigoProducto, @CodigoBodega, @TipoAjuste, @Cantidad,
                 @CantidadAnterior, @CantidadNueva, LTRIM(RTRIM(@Motivo)), @CodigoUsuario);

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

-- 4. Consultar historial (todos o filtrado por producto / bodega)
CREATE OR ALTER PROCEDURE Usp_Inventario_HistorialConsultar
    @CodigoProducto INT = NULL,
    @CodigoBodega INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
            SELECT
                a.CodigoAjuste,
                a.CodigoProductoBodega,
                p.Nombre        AS Producto,
                b.Nombre        AS Bodega,
                a.TipoAjuste,
                a.Cantidad,
                a.CantidadAnterior,
                a.CantidadNueva,
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

select * from tbl_AjusteInventario;

SELECT name FROM sys.procedures WHERE name LIKE 'Usp_Inventario%';

SELECT * FROM tbl_AjusteInventario;