-- ============================================================
-- Módulo: Asignación de pedidos a piloto (repartidor)
-- Permite asignar pedidos (agrupados por vendedor/CodigoEmpleado)
-- a un piloto de forma completa o granular.
-- Script de tablas y procedimientos almacenados.
-- NOTA: requiere tablas base existentes (tbl_Pedidos, repartidores,
--       tbl_Clientes, tbl_Empleados, tbl_EstadosPedido, tbl_PedidoDetalle).
--       Ajustado con esquema real (datos.txt) para pedidos/clientes/empleados/estados/detalle.
--       PENDIENTE: no se incluyo la tabla de repartidores/pilotos; reemplace
--       dbo.tbl_Repartidores y sus columnas (CodigoRepartidor, CodigoEmpleado, Estado)
--       en FKs y SPs segun su BD real.
-- ============================================================

-- 1) TABLA DE ASIGNACIÓN (vigencia por pedido, patrón planificador)
IF OBJECT_ID('dbo.tbl_PedidoRepartidor', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tbl_PedidoRepartidor
    (
        CodigoPedidoRepartidor INT IDENTITY(1,1) NOT NULL,
        CodigoPedido           INT NOT NULL,
        CodigoRepartidor       INT NOT NULL,
        FechaAsignacion        DATETIME NOT NULL CONSTRAINT DF_tbl_PedidoRepartidor_FechaAsignacion DEFAULT GETDATE(),
        CodigoUsuarioAsigna    INT NOT NULL,
        FechaFin               DATETIME NULL,
        CONSTRAINT PK_tbl_PedidoRepartidor PRIMARY KEY (CodigoPedidoRepartidor)
    );

    CREATE INDEX IX_tbl_PedidoRepartidor_PedidoVigente
        ON dbo.tbl_PedidoRepartidor (CodigoPedido, FechaFin);

    CREATE INDEX IX_tbl_PedidoRepartidor_RepartidorVigente
        ON dbo.tbl_PedidoRepartidor (CodigoRepartidor, FechaFin);
END
GO

-- FKs condicionales (evita error si las tablas base aún no existen o tienen otro nombre)
IF OBJECT_ID('dbo.tbl_PedidoRepartidor', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_tbl_PedidoRepartidor_Pedido')
BEGIN
    IF OBJECT_ID('dbo.tbl_Pedidos', 'U') IS NOT NULL
        ALTER TABLE dbo.tbl_PedidoRepartidor WITH CHECK
            ADD CONSTRAINT FK_tbl_PedidoRepartidor_Pedido FOREIGN KEY (CodigoPedido)
            REFERENCES dbo.tbl_Pedidos (CodigoPedido);
    ELSE
        PRINT 'Aviso: no se creó FK a pedidos porque dbo.tbl_Pedidos no existe. Cree la FK manualmente cuando exista.';
END
GO

IF OBJECT_ID('dbo.tbl_PedidoRepartidor', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_tbl_PedidoRepartidor_Repartidor')
BEGIN
    DECLARE @SqlFk NVARCHAR(MAX);
    DECLARE @TablaRep NVARCHAR(128);

    SET @TablaRep =
        CASE
            WHEN OBJECT_ID('dbo.tbl_Repartidores', 'U') IS NOT NULL THEN N'dbo.tbl_Repartidores'
            WHEN OBJECT_ID('dbo.tbl_Repartidor', 'U')  IS NOT NULL THEN N'dbo.tbl_Repartidor'
            ELSE NULL
        END;

    IF @TablaRep IS NOT NULL
    BEGIN
        SET @SqlFk = N'ALTER TABLE dbo.tbl_PedidoRepartidor WITH CHECK
            ADD CONSTRAINT FK_tbl_PedidoRepartidor_Repartidor FOREIGN KEY (CodigoRepartidor)
            REFERENCES ' + @TablaRep + N' (CodigoRepartidor);';
        EXEC sp_executesql @SqlFk;
        PRINT 'FK de repartidor creada contra ' + @TablaRep + '.';
        IF @TablaRep <> N'dbo.tbl_Repartidores'
            PRINT 'IMPORTANTE: los SPs usan tbl_Repartidores; reemplace ese nombre por ' + @TablaRep + ' en este script si aplica.';
    END
    ELSE
        PRINT 'Aviso: no se creó FK a repartidor porque no existe dbo.tbl_Repartidores ni dbo.tbl_Repartidor. Cree la FK manualmente cuando exista.';
END
GO

-- 2) CONSULTAR PEDIDOS CON ASIGNACIÓN VIGENTE (agrupables por vendedor)
-- AJUSTAR: tabla/columnas de repartidor (piloto) según su BD real.
--          Reemplace 'dbo.tbl_Repartidores' y sus columnas (CodigoRepartidor,
--          CodigoEmpleado, Estado) donde se indica.
IF OBJECT_ID('dbo.Usp_PedidoRepartidor_Consultar', 'P') IS NOT NULL
    DROP PROCEDURE dbo.Usp_PedidoRepartidor_Consultar;
GO

CREATE PROCEDURE dbo.Usp_PedidoRepartidor_Consultar
    @FechaDesde     DATE,
    @FechaHasta     DATE,
    @CodigoEmpleado INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @FechaDesde IS NULL OR @FechaHasta IS NULL
        THROW 51001, 'Debe indicar el rango de fechas.', 1;

    IF @FechaDesde > @FechaHasta
        THROW 51002, 'La fecha inicial no puede ser mayor que la fecha final.', 1;

    SELECT
        p.CodigoPedido,
        p.CodigoCliente,
        ISNULL(c.Nombre, '') AS NombreCliente,
        p.CodigoEmpleado,
        LTRIM(RTRIM(CONCAT(
            ISNULL(e.PrimerNombre, ''), ' ',
            ISNULL(e.SegundoNombre, ''), ' ',
            ISNULL(e.PrimerApellido, ''), ' ',
            ISNULL(e.SegundoApellido, '')
        ))) AS NombreVendedor,
        p.FechaPedido,
        p.CodigoEstadoPedido,
        ISNULL(ep.Nombre, CAST(p.CodigoEstadoPedido AS VARCHAR(20))) AS NombreEstado,
        ISNULL((
            SELECT SUM(pd.Cantidad * pd.PrecioVenta)
            FROM dbo.tbl_PedidoDetalle pd
            WHERE pd.CodigoPedido = p.CodigoPedido
        ), 0) AS TotalVenta,
        pr.CodigoPedidoRepartidor,
        pr.CodigoRepartidor,
        CASE
            WHEN pr.CodigoRepartidor IS NULL THEN NULL
            ELSE LTRIM(RTRIM(CONCAT(
                ISNULL(er.PrimerNombre, ''), ' ',
                ISNULL(er.SegundoNombre, ''), ' ',
                ISNULL(er.PrimerApellido, ''), ' ',
                ISNULL(er.SegundoApellido, '')
            )))
        END AS NombreRepartidor
    FROM dbo.tbl_Pedidos p
    LEFT JOIN dbo.Tbl_Clientes c ON c.CodigoCliente = p.CodigoCliente
    LEFT JOIN dbo.tbl_Empleados e ON e.CodigoEmpleado = p.CodigoEmpleado
    LEFT JOIN dbo.tbl_EstadosPedido ep ON ep.CodigoEstadoPedido = p.CodigoEstadoPedido
    OUTER APPLY (
        SELECT TOP 1
            a.CodigoPedidoRepartidor,
            a.CodigoRepartidor
        FROM dbo.tbl_PedidoRepartidor a
        WHERE a.CodigoPedido = p.CodigoPedido
          AND a.FechaFin IS NULL
        ORDER BY a.FechaAsignacion DESC, a.CodigoPedidoRepartidor DESC
    ) pr
    -- AJUSTAR nombre de tabla repartidor si difiere:
    LEFT JOIN dbo.tbl_Repartidores r ON r.CodigoRepartidor = pr.CodigoRepartidor
    LEFT JOIN dbo.tbl_Empleados er ON er.CodigoEmpleado = r.CodigoEmpleado
    WHERE CAST(p.FechaPedido AS DATE) BETWEEN @FechaDesde AND @FechaHasta
      AND (@CodigoEmpleado IS NULL OR p.CodigoEmpleado = @CodigoEmpleado)
    ORDER BY e.PrimerNombre, e.PrimerApellido, p.FechaPedido, p.CodigoPedido;
END
GO

-- 3) ASIGNAR PEDIDOS A PILOTO (ruta completa o granular)
IF OBJECT_ID('dbo.Usp_PedidoRepartidor_Asignar', 'P') IS NOT NULL
    DROP PROCEDURE dbo.Usp_PedidoRepartidor_Asignar;
GO

CREATE PROCEDURE dbo.Usp_PedidoRepartidor_Asignar
    @PedidosJson      NVARCHAR(MAX),
    @CodigoRepartidor INT,
    @CodigoUsuario    INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF ISJSON(@PedidosJson) = 0
            THROW 51010, 'La lista de pedidos no es válida.', 1;

        IF @CodigoRepartidor IS NULL OR @CodigoRepartidor <= 0
            THROW 51011, 'Debe indicar un piloto válido.', 1;

        IF @CodigoUsuario IS NULL OR @CodigoUsuario <= 0
            THROW 51012, 'Debe indicar el usuario que realiza la asignación.', 1;

                -- AJUSTAR tabla/columnas de repartidor segun su BD real (CodigoRepartidor, Estado)
        IF NOT EXISTS (SELECT 1 FROM dbo.tbl_Repartidores WHERE CodigoRepartidor = @CodigoRepartidor AND Estado = 1)
            THROW 51013, 'El piloto no existe o esta inactivo.', 1;

        DECLARE @Pedidos TABLE (CodigoPedido INT PRIMARY KEY);

        INSERT INTO @Pedidos (CodigoPedido)
        SELECT DISTINCT TRY_CAST(value AS INT)
        FROM OPENJSON(@PedidosJson);

        DELETE FROM @Pedidos WHERE CodigoPedido IS NULL OR CodigoPedido <= 0;

        IF NOT EXISTS (SELECT 1 FROM @Pedidos)
            THROW 51014, 'Debe seleccionar al menos un pedido.', 1;

        IF EXISTS (
            SELECT 1
            FROM @Pedidos s
            WHERE NOT EXISTS (SELECT 1 FROM tbl_Pedidos p WHERE p.CodigoPedido = s.CodigoPedido)
        )
            THROW 51015, 'Uno o más pedidos no existen.', 1;

        BEGIN TRANSACTION;

            -- Cerrar asignación vigente previa de los pedidos indicados
            UPDATE a
            SET a.FechaFin = GETDATE()
            FROM dbo.tbl_PedidoRepartidor a
            INNER JOIN @Pedidos s ON s.CodigoPedido = a.CodigoPedido
            WHERE a.FechaFin IS NULL;

            -- Crear nueva asignación vigente
            INSERT INTO dbo.tbl_PedidoRepartidor (CodigoPedido, CodigoRepartidor, FechaAsignacion, CodigoUsuarioAsigna, FechaFin)
            SELECT s.CodigoPedido, @CodigoRepartidor, GETDATE(), @CodigoUsuario, NULL
            FROM @Pedidos s;

        COMMIT TRANSACTION;

        SELECT 1 AS Exito,
               'Pedidos asignados correctamente.' AS Mensaje,
               (SELECT COUNT(*) FROM @Pedidos) AS CantidadAsignada;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @MensajeFinal NVARCHAR(2048);
        SET @MensajeFinal = CONCAT(
            'Procedimiento: ', COALESCE(ERROR_PROCEDURE(), OBJECT_NAME(@@PROCID)),
            ' | Línea: ', ERROR_LINE(),
            ' | Número: ', ERROR_NUMBER(),
            ' | Mensaje: ', ERROR_MESSAGE()
        );

        THROW 50000, @MensajeFinal, 1;
    END CATCH
END
GO

-- 4) QUITAR ASIGNACIÓN VIGENTE DE PEDIDOS
IF OBJECT_ID('dbo.Usp_PedidoRepartidor_Quitar', 'P') IS NOT NULL
    DROP PROCEDURE dbo.Usp_PedidoRepartidor_Quitar;
GO

CREATE PROCEDURE dbo.Usp_PedidoRepartidor_Quitar
    @PedidosJson   NVARCHAR(MAX),
    @CodigoUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF ISJSON(@PedidosJson) = 0
            THROW 51020, 'La lista de pedidos no es válida.', 1;

        DECLARE @Pedidos TABLE (CodigoPedido INT PRIMARY KEY);

        INSERT INTO @Pedidos (CodigoPedido)
        SELECT DISTINCT TRY_CAST(value AS INT)
        FROM OPENJSON(@PedidosJson);

        DELETE FROM @Pedidos WHERE CodigoPedido IS NULL OR CodigoPedido <= 0;

        IF NOT EXISTS (SELECT 1 FROM @Pedidos)
            THROW 51021, 'Debe seleccionar al menos un pedido.', 1;

        BEGIN TRANSACTION;

            UPDATE a
            SET a.FechaFin = GETDATE()
            FROM dbo.tbl_PedidoRepartidor a
            INNER JOIN @Pedidos s ON s.CodigoPedido = a.CodigoPedido
            WHERE a.FechaFin IS NULL;

        COMMIT TRANSACTION;

        SELECT 1 AS Exito,
               'Asignación retirada correctamente.' AS Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @MensajeFinal NVARCHAR(2048);
        SET @MensajeFinal = CONCAT(
            'Procedimiento: ', COALESCE(ERROR_PROCEDURE(), OBJECT_NAME(@@PROCID)),
            ' | Línea: ', ERROR_LINE(),
            ' | Número: ', ERROR_NUMBER(),
            ' | Mensaje: ', ERROR_MESSAGE()
        );

        THROW 50000, @MensajeFinal, 1;
    END CATCH
END
GO

