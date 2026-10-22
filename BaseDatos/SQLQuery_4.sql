SELECT * FROM tbl_Modulo;
SELECT * FROM tbl_Rol;

SELECT s.name AS esquema, t.name AS tabla
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
ORDER BY t.name;

SELECT * FROM tbl_Modulos;
SELECT * FROM tbl_Roles;
SELECT * FROM tbl_RolModulo;

-- 1. Crear los módulos (si no existen)
IF NOT EXISTS (SELECT 1 FROM tbl_Modulos WHERE RutaFront = '/dashboard/empleados')
    INSERT INTO tbl_Modulos (Nombre, RutaFront, Icono, Estado, OrdenMostrar)
    VALUES ('Empleados', '/dashboard/empleados', 'Users', 1, 11);

IF NOT EXISTS (SELECT 1 FROM tbl_Modulos WHERE RutaFront = '/dashboard/categorias')
    INSERT INTO tbl_Modulos (Nombre, RutaFront, Icono, Estado, OrdenMostrar)
    VALUES ('Categorías', '/dashboard/categorias', 'Boxes', 1, 12);

-- 2. Dar permiso a los roles 1 (admin) y 4 (Administradores)
INSERT INTO tbl_RolModulo
    (CodigoRol, CodigoModulo, EsActivo, FechaAsignacion,
     PermiteConsultar, PermiteAgregar, PermiteEditar, PermiteAnular)
SELECT r.CodigoRol, m.CodigoModulo, 1, SYSDATETIME(), 1, 1, 1, 1
FROM (VALUES (1), (4)) AS r(CodigoRol)
CROSS JOIN tbl_Modulos m
WHERE m.RutaFront IN ('/dashboard/empleados', '/dashboard/categorias')
  AND NOT EXISTS (
      SELECT 1 FROM tbl_RolModulo rm
      WHERE rm.CodigoRol = r.CodigoRol AND rm.CodigoModulo = m.CodigoModulo
  );

-- 3. Verificar
SELECT m.CodigoModulo, m.Nombre, m.RutaFront, rm.CodigoRol, rm.EsActivo
FROM tbl_Modulos m
JOIN tbl_RolModulo rm ON rm.CodigoModulo = m.CodigoModulo
WHERE m.RutaFront IN ('/dashboard/empleados', '/dashboard/categorias');

SELECT name FROM sys.procedures
WHERE name LIKE 'Usp_Empleados%' OR name LIKE 'Usp_Categoria%';

select * from tbl_Categoria;

ALTER TABLE tbl_Categoria
ADD Estado BIT NOT NULL CONSTRAINT DF_tbl_Categoria_Estado DEFAULT 1;

CREATE OR ALTER PROCEDURE Usp_Empleados_Eliminar
    @CodigoEmpleado INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
            UPDATE tbl_Empleados
            SET Estado = 0
            WHERE CodigoEmpleado = @CodigoEmpleado;

            IF @@ROWCOUNT = 0
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            COMMIT TRANSACTION;

            SELECT 1 AS Exito, 'Registro borrado correctamente.' AS Mensaje;
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


CREATE OR ALTER PROCEDURE Usp_Categoria_Eliminar
    @CodigoCategoria INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
            UPDATE tbl_Categoria
            SET Estado = 0
            WHERE CodigoCategoria = @CodigoCategoria;

            IF @@ROWCOUNT = 0
                THROW 50001, 'No se encontró el registro solicitado.', 1;

            COMMIT TRANSACTION;

            SELECT 1 AS Exito, 'Registro borrado correctamente.' AS Mensaje;
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
            WHERE Estado = 1
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