-- ============================================================
-- CRUD: tbl_Vendedores  (Vendedores)
-- Depende de tbl_Empleados (cada vendedor es un empleado).
-- Borrado LÓGICO: "eliminar" solo pone Estado = 0.
-- ============================================================

-- 1) TABLA (solo se crea si todavía no existe)
IF OBJECT_ID('tbl_Vendedores', 'U') IS NULL
BEGIN
    CREATE TABLE tbl_Vendedores (
        CodigoVendedor   INT IDENTITY(1,1) NOT NULL,
        CodigoEmpleado INT NOT NULL,
        Estado         BIT NOT NULL CONSTRAINT DF_tbl_Vendedores_Estado DEFAULT 1,
        CONSTRAINT PK_tbl_Vendedores PRIMARY KEY (CodigoVendedor),
        CONSTRAINT FK_tbl_Vendedores_Empleados FOREIGN KEY (CodigoEmpleado)
            REFERENCES tbl_Empleados (CodigoEmpleado),
        CONSTRAINT UQ_tbl_Vendedores_Empleado UNIQUE (CodigoEmpleado)
    );
END
GO

-- 2) AGREGAR
CREATE OR ALTER PROCEDURE Usp_Vendedores_Agregar
    @CodigoEmpleado INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

            IF NOT EXISTS (SELECT 1 FROM tbl_Empleados
                           WHERE CodigoEmpleado = @CodigoEmpleado AND Estado = 1)
                THROW 50001, 'El empleado no existe o está inactivo.', 1;

            IF EXISTS (SELECT 1 FROM tbl_Vendedores
                       WHERE CodigoEmpleado = @CodigoEmpleado AND Estado = 1)
                THROW 50002, 'El empleado ya está registrado como vendedor.', 1;

            DECLARE @CodigoGenerado INT;

            -- Si ya estuvo registrado y está inactivo, se reactiva (no se duplica)
            SELECT @CodigoGenerado = CodigoVendedor
            FROM tbl_Vendedores
            WHERE CodigoEmpleado = @CodigoEmpleado AND Estado = 0;

            IF @CodigoGenerado IS NOT NULL
            BEGIN
                UPDATE tbl_Vendedores SET Estado = 1 WHERE CodigoVendedor = @CodigoGenerado;
            END
            ELSE
            BEGIN
                INSERT INTO tbl_Vendedores (CodigoEmpleado, Estado)
                VALUES (@CodigoEmpleado, 1);

                SET @CodigoGenerado = CAST(SCOPE_IDENTITY() AS INT);
            END

            COMMIT TRANSACTION;

            SELECT 1 AS Exito,
                   'Registro agregado correctamente.' AS Mensaje,
                   @CodigoGenerado AS CodigoVendedor;
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

-- 3) EDITAR
CREATE OR ALTER PROCEDURE Usp_Vendedores_Editar
    @CodigoVendedor INT,
    @CodigoEmpleado INT,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

            IF NOT EXISTS (SELECT 1 FROM tbl_Vendedores WHERE CodigoVendedor = @CodigoVendedor)
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            IF NOT EXISTS (SELECT 1 FROM tbl_Empleados
                           WHERE CodigoEmpleado = @CodigoEmpleado AND Estado = 1)
                THROW 50002, 'El empleado no existe o está inactivo.', 1;

            IF EXISTS (SELECT 1 FROM tbl_Vendedores
                       WHERE CodigoEmpleado = @CodigoEmpleado
                         AND CodigoVendedor <> @CodigoVendedor)
                THROW 50003, 'Ese empleado ya tiene un registro de vendedor (puede estar inactivo; reactívalo desde la lista).', 1;

            UPDATE tbl_Vendedores
            SET CodigoEmpleado = @CodigoEmpleado,
                Estado = @Estado
            WHERE CodigoVendedor = @CodigoVendedor;

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

-- 4) ELIMINAR (lógico)
CREATE OR ALTER PROCEDURE Usp_Vendedores_Eliminar
    @CodigoVendedor INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

            UPDATE tbl_Vendedores
            SET Estado = 0
            WHERE CodigoVendedor = @CodigoVendedor;

            IF @@ROWCOUNT = 0
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            COMMIT TRANSACTION;

            SELECT 1 AS Exito, 'Registro desactivado correctamente.' AS Mensaje;
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

-- 5) CONSULTAR
CREATE OR ALTER PROCEDURE Usp_Vendedores_Consultar
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            x.CodigoVendedor,
            x.CodigoEmpleado,
            CONCAT_WS(' ', e.PrimerNombre, NULLIF(e.SegundoNombre, ''),
                           e.PrimerApellido, NULLIF(e.SegundoApellido, '')) AS NombreEmpleado,
            e.Telefono,
            x.Estado
        FROM tbl_Vendedores x
        INNER JOIN tbl_Empleados e ON e.CodigoEmpleado = x.CodigoEmpleado
        ORDER BY x.CodigoVendedor;
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

-- 6) BUSCAR
CREATE OR ALTER PROCEDURE Usp_Vendedores_Buscar
    @CodigoVendedor INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            x.CodigoVendedor,
            x.CodigoEmpleado,
            CONCAT_WS(' ', e.PrimerNombre, NULLIF(e.SegundoNombre, ''),
                           e.PrimerApellido, NULLIF(e.SegundoApellido, '')) AS NombreEmpleado,
            e.Telefono,
            x.Estado
        FROM tbl_Vendedores x
        INNER JOIN tbl_Empleados e ON e.CodigoEmpleado = x.CodigoEmpleado
        WHERE x.CodigoVendedor = @CodigoVendedor;
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
-- CRUD: tbl_Repartidores  (Repartidores)
-- Depende de tbl_Empleados (cada repartidor es un empleado).
-- Borrado LÓGICO: "eliminar" solo pone Estado = 0.
-- ============================================================

-- 1) TABLA (solo se crea si todavía no existe)
IF OBJECT_ID('tbl_Repartidores', 'U') IS NULL
BEGIN
    CREATE TABLE tbl_Repartidores (
        CodigoRepartidor   INT IDENTITY(1,1) NOT NULL,
        CodigoEmpleado INT NOT NULL,
        Estado         BIT NOT NULL CONSTRAINT DF_tbl_Repartidores_Estado DEFAULT 1,
        CONSTRAINT PK_tbl_Repartidores PRIMARY KEY (CodigoRepartidor),
        CONSTRAINT FK_tbl_Repartidores_Empleados FOREIGN KEY (CodigoEmpleado)
            REFERENCES tbl_Empleados (CodigoEmpleado),
        CONSTRAINT UQ_tbl_Repartidores_Empleado UNIQUE (CodigoEmpleado)
    );
END
GO

-- 2) AGREGAR
CREATE OR ALTER PROCEDURE Usp_Repartidores_Agregar
    @CodigoEmpleado INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

            IF NOT EXISTS (SELECT 1 FROM tbl_Empleados
                           WHERE CodigoEmpleado = @CodigoEmpleado AND Estado = 1)
                THROW 50001, 'El empleado no existe o está inactivo.', 1;

            IF EXISTS (SELECT 1 FROM tbl_Repartidores
                       WHERE CodigoEmpleado = @CodigoEmpleado AND Estado = 1)
                THROW 50002, 'El empleado ya está registrado como repartidor.', 1;

            DECLARE @CodigoGenerado INT;

            -- Si ya estuvo registrado y está inactivo, se reactiva (no se duplica)
            SELECT @CodigoGenerado = CodigoRepartidor
            FROM tbl_Repartidores
            WHERE CodigoEmpleado = @CodigoEmpleado AND Estado = 0;

            IF @CodigoGenerado IS NOT NULL
            BEGIN
                UPDATE tbl_Repartidores SET Estado = 1 WHERE CodigoRepartidor = @CodigoGenerado;
            END
            ELSE
            BEGIN
                INSERT INTO tbl_Repartidores (CodigoEmpleado, Estado)
                VALUES (@CodigoEmpleado, 1);

                SET @CodigoGenerado = CAST(SCOPE_IDENTITY() AS INT);
            END

            COMMIT TRANSACTION;

            SELECT 1 AS Exito,
                   'Registro agregado correctamente.' AS Mensaje,
                   @CodigoGenerado AS CodigoRepartidor;
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

-- 3) EDITAR
CREATE OR ALTER PROCEDURE Usp_Repartidores_Editar
    @CodigoRepartidor INT,
    @CodigoEmpleado INT,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

            IF NOT EXISTS (SELECT 1 FROM tbl_Repartidores WHERE CodigoRepartidor = @CodigoRepartidor)
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            IF NOT EXISTS (SELECT 1 FROM tbl_Empleados
                           WHERE CodigoEmpleado = @CodigoEmpleado AND Estado = 1)
                THROW 50002, 'El empleado no existe o está inactivo.', 1;

            IF EXISTS (SELECT 1 FROM tbl_Repartidores
                       WHERE CodigoEmpleado = @CodigoEmpleado
                         AND CodigoRepartidor <> @CodigoRepartidor)
                THROW 50003, 'Ese empleado ya tiene un registro de repartidor (puede estar inactivo; reactívalo desde la lista).', 1;

            UPDATE tbl_Repartidores
            SET CodigoEmpleado = @CodigoEmpleado,
                Estado = @Estado
            WHERE CodigoRepartidor = @CodigoRepartidor;

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

-- 4) ELIMINAR (lógico)
CREATE OR ALTER PROCEDURE Usp_Repartidores_Eliminar
    @CodigoRepartidor INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

            UPDATE tbl_Repartidores
            SET Estado = 0
            WHERE CodigoRepartidor = @CodigoRepartidor;

            IF @@ROWCOUNT = 0
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            COMMIT TRANSACTION;

            SELECT 1 AS Exito, 'Registro desactivado correctamente.' AS Mensaje;
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

-- 5) CONSULTAR
CREATE OR ALTER PROCEDURE Usp_Repartidores_Consultar
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            x.CodigoRepartidor,
            x.CodigoEmpleado,
            CONCAT_WS(' ', e.PrimerNombre, NULLIF(e.SegundoNombre, ''),
                           e.PrimerApellido, NULLIF(e.SegundoApellido, '')) AS NombreEmpleado,
            e.Telefono,
            x.Estado
        FROM tbl_Repartidores x
        INNER JOIN tbl_Empleados e ON e.CodigoEmpleado = x.CodigoEmpleado
        ORDER BY x.CodigoRepartidor;
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

-- 6) BUSCAR
CREATE OR ALTER PROCEDURE Usp_Repartidores_Buscar
    @CodigoRepartidor INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            x.CodigoRepartidor,
            x.CodigoEmpleado,
            CONCAT_WS(' ', e.PrimerNombre, NULLIF(e.SegundoNombre, ''),
                           e.PrimerApellido, NULLIF(e.SegundoApellido, '')) AS NombreEmpleado,
            e.Telefono,
            x.Estado
        FROM tbl_Repartidores x
        INNER JOIN tbl_Empleados e ON e.CodigoEmpleado = x.CodigoEmpleado
        WHERE x.CodigoRepartidor = @CodigoRepartidor;
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

SELECT * FROM tbl_Clientes;

select * from tbl_Repartidores;
select * from tbl_Vendedores;

SELECT * FROM tbl_Modulos;
SELECT * FROM tbl_RolModulo WHERE CodigoModulo IN (11, 12);


-- 1) Módulos nuevos (si ya existen, no se duplican)
IF NOT EXISTS (SELECT 1 FROM tbl_Modulos WHERE RutaFront = '/dashboard/vendedores')
    INSERT INTO tbl_Modulos (Nombre, RutaFront, Icono, Estado, OrdenMostrar)
    VALUES ('Vendedores', '/dashboard/vendedores', 'BriefcaseBusiness', 1, 13);

IF NOT EXISTS (SELECT 1 FROM tbl_Modulos WHERE RutaFront = '/dashboard/repartidores')
    INSERT INTO tbl_Modulos (Nombre, RutaFront, Icono, Estado, OrdenMostrar)
    VALUES ('Repartidores', '/dashboard/repartidores', 'Truck', 1, 14);

-- 2) Permisos para los roles 1 y 4 (busca el código por la ruta, no hace falta saber el número)
INSERT INTO tbl_RolModulo
    (CodigoRol, CodigoModulo, EsActivo, FechaAsignacion,
     PermiteConsultar, PermiteAgregar, PermiteEditar, PermiteAnular)
SELECT r.CodigoRol, m.CodigoModulo, 1, SYSDATETIME(), 1, 1, 1, 1
FROM (VALUES (1), (4)) AS r(CodigoRol)
CROSS JOIN tbl_Modulos m
WHERE m.RutaFront IN ('/dashboard/vendedores', '/dashboard/repartidores')
  AND NOT EXISTS (SELECT 1 FROM tbl_RolModulo rm
                  WHERE rm.CodigoRol = r.CodigoRol
                    AND rm.CodigoModulo = m.CodigoModulo);

-- 3) Verificar
SELECT * FROM tbl_Modulos WHERE CodigoModulo >= 13;
SELECT * FROM tbl_RolModulo WHERE CodigoModulo >= 13;