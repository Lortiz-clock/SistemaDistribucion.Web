-- ============================================================
-- TABLA: PRODUCTOS
-- ============================================================
CREATE TABLE tbl_Productos (
    CodigoProducto INT IDENTITY(1,1) PRIMARY KEY,
    Codigo         NVARCHAR(50) NOT NULL UNIQUE,
    Nombre         NVARCHAR(150) NOT NULL,
    Costo          DECIMAL(12,2) NOT NULL,
    MargenMinimo   DECIMAL(5,2) NULL,
    PrecioMinimo   DECIMAL(12,2) NULL,
    FactorFardo    INT NULL,
    FactorMaster   INT NULL,
    StockMinimo    INT NOT NULL DEFAULT 0,
    EsBonificable  BIT NOT NULL DEFAULT 0,
    Estado         BIT NOT NULL DEFAULT 1
);
GO

-- ============================================================
-- TABLA: BODEGAS
-- ============================================================
CREATE TABLE tbl_Bodegas (
    CodigoBodega INT IDENTITY(1,1) PRIMARY KEY,
    Nombre       NVARCHAR(100) NOT NULL,
    Tipo         NVARCHAR(50) NULL,
    Estado       BIT NOT NULL DEFAULT 1
);
GO

-- ============================================================
-- TABLA: PRODUCTO_BODEGA (stock)
-- ============================================================
CREATE TABLE tbl_ProductoBodega (
    CodigoProducto INT NOT NULL,
    CodigoBodega   INT NOT NULL,
    StockActual    INT NOT NULL DEFAULT 0,
    Estado         BIT NOT NULL DEFAULT 1,
    PRIMARY KEY (CodigoProducto, CodigoBodega),
    FOREIGN KEY (CodigoProducto) REFERENCES tbl_Productos(CodigoProducto),
    FOREIGN KEY (CodigoBodega) REFERENCES tbl_Bodegas(CodigoBodega)
);
GO

-- ============================================================
-- CRUD: tbl_Empleados
-- ============================================================

CREATE OR ALTER PROCEDURE Usp_Empleados_Agregar
    @Telefono VARCHAR(20),
    @FechaIngreso DATE,
    @Estado BIT,
    @PrimerNombre NVARCHAR(30),
    @SegundoNombre NVARCHAR(30),
    @PrimerApellido NVARCHAR(30),
    @SegundoApellido NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
            INSERT INTO tbl_Empleados (
                Telefono,
                FechaIngreso,
                Estado,
                PrimerNombre,
                SegundoNombre,
                PrimerApellido,
                SegundoApellido
            )
            VALUES (
                @Telefono,
                @FechaIngreso,
                @Estado,
                @PrimerNombre,
                @SegundoNombre,
                @PrimerApellido,
                @SegundoApellido
            );

            DECLARE @CodigoGenerado INT = CAST(SCOPE_IDENTITY() AS INT);

            COMMIT TRANSACTION;

            SELECT 1 AS Exito,
                   'Registro agregado correctamente.' AS Mensaje,
                   @CodigoGenerado AS CodigoEmpleado;
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

CREATE OR ALTER PROCEDURE Usp_Empleados_Editar
    @CodigoEmpleado INT,
    @Telefono VARCHAR(20),
    @FechaIngreso DATE,
    @Estado BIT,
    @PrimerNombre NVARCHAR(30),
    @SegundoNombre NVARCHAR(30),
    @PrimerApellido NVARCHAR(30),
    @SegundoApellido NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
            UPDATE tbl_Empleados
            SET Telefono = @Telefono,
                FechaIngreso = @FechaIngreso,
                Estado = @Estado,
                PrimerNombre = @PrimerNombre,
                SegundoNombre = @SegundoNombre,
                PrimerApellido = @PrimerApellido,
                SegundoApellido = @SegundoApellido
            WHERE CodigoEmpleado = @CodigoEmpleado;

            IF @@ROWCOUNT = 0
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            COMMIT TRANSACTION;

            SELECT 1 AS Exito, 'Registro actualizado correctamente.' AS Mensaje;
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

CREATE OR ALTER PROCEDURE Usp_Empleados_Eliminar
    @CodigoEmpleado INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
            DELETE FROM tbl_Empleados
            WHERE CodigoEmpleado = @CodigoEmpleado;

            IF @@ROWCOUNT = 0
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            COMMIT TRANSACTION;

            SELECT 1 AS Exito, 'Registro eliminado correctamente.' AS Mensaje;
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

CREATE OR ALTER PROCEDURE Usp_Empleados_Consultar
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
            SELECT
                CodigoEmpleado,
                Telefono,
                FechaIngreso,
                Estado,
                PrimerNombre,
                SegundoNombre,
                PrimerApellido,
                SegundoApellido
            FROM tbl_Empleados
            ORDER BY CodigoEmpleado;
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

CREATE OR ALTER PROCEDURE Usp_Empleados_Buscar
    @CodigoEmpleado INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
            SELECT
                CodigoEmpleado,
                Telefono,
                FechaIngreso,
                Estado,
                PrimerNombre,
                SegundoNombre,
                PrimerApellido,
                SegundoApellido
            FROM tbl_Empleados
            WHERE CodigoEmpleado = @CodigoEmpleado;
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


-- ============================================================
-- CRUD: tbl_Categoria
-- ============================================================

CREATE OR ALTER PROCEDURE Usp_Categoria_Agregar
    @Nombre VARCHAR(100),
    @Descripcion VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
            INSERT INTO tbl_Categoria (
                Nombre,
                Descripcion
            )
            VALUES (
                @Nombre,
                @Descripcion
            );

            DECLARE @CodigoGenerado INT = CAST(SCOPE_IDENTITY() AS INT);

            COMMIT TRANSACTION;

            SELECT 1 AS Exito,
                   'Registro agregado correctamente.' AS Mensaje,
                   @CodigoGenerado AS CodigoCategoria;
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

CREATE OR ALTER PROCEDURE Usp_Categoria_Editar
    @CodigoCategoria INT,
    @Nombre VARCHAR(100),
    @Descripcion VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
            UPDATE tbl_Categoria
            SET Nombre = @Nombre,
                Descripcion = @Descripcion
            WHERE CodigoCategoria = @CodigoCategoria;

            IF @@ROWCOUNT = 0
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            COMMIT TRANSACTION;

            SELECT 1 AS Exito, 'Registro actualizado correctamente.' AS Mensaje;
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

CREATE OR ALTER PROCEDURE Usp_Categoria_Eliminar
    @CodigoCategoria INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
            DELETE FROM tbl_Categoria
            WHERE CodigoCategoria = @CodigoCategoria;

            IF @@ROWCOUNT = 0
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            COMMIT TRANSACTION;

            SELECT 1 AS Exito, 'Registro eliminado correctamente.' AS Mensaje;
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

CREATE OR ALTER PROCEDURE Usp_Categoria_Consultar
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
            SELECT
                CodigoCategoria,
                Nombre,
                Descripcion
            FROM tbl_Categoria
            ORDER BY CodigoCategoria;
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

CREATE OR ALTER PROCEDURE Usp_Categoria_Buscar
    @CodigoCategoria INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
            SELECT
                CodigoCategoria,
                Nombre,
                Descripcion
            FROM tbl_Categoria
            WHERE CodigoCategoria = @CodigoCategoria;
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


SELECT * FROM tbl_Empleados;
SELECT * FROM tbl_Categoria;
SELECT * FROM tbl_Empleados;
SELECT * FROM tbl_Usuarios;