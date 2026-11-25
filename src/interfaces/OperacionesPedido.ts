export interface PedidoOperacion {
  codigoPedido: number; codigoCliente: number; nombreCliente: string; direccion: string; referencia: string;
  latitud?: number | null; longitud?: number | null; fechaPedido: string; fechaEntregaProgramada?: string | null;
  codigoEstadoPedido: number; nombreEstado: string; codigoRepartidor?: number | null; nombreRepartidor?: string; codigoDespacho?: number | null; estadoDespacho?: string;
  totalVenta: number; totalUnidades: number; observaciones: string;
}
export interface ComisionEntrega { codigoComisionEntrega: number; porcentajeMinimo: number; porcentajeMaximo?: number | null; montoPago: number; estado: boolean; }
export interface ReporteVendedor { codigoEmpleado: number; nombreEmpleado: string; ventaTotal: number; utilidadTotal: number; pedidosEntregados: number; totalPedidos: number; porcentajeEntrega: number; comision: number; }
export interface DashboardVendedorItem { codigoEmpleado: number; nombreEmpleado: string; ventaTotal: number; ventaDia: number; utilidadReferencia: number; utilidadReal: number; utilidadDia: number; utilidadPerdida: number; montoRechazadoDevuelto: number; totalPedidos: number; pedidosRechazados: number; pedidosLiquidados: number; pedidosEntregados: number; clientesNoVisitados: number; }
export interface FacturaFEL { codigoFacturaFEL: number; codigoPedido?: number | null; fechaEmision: string; serie?: string | null; numero?: string | null; uuid?: string | null; total: number; estado: string; observaciones?: string | null; totalEnvio: number; totalContable: number; }
export interface FacturaFELDetalleLinea { codigoProducto: number; nombreProducto: string; cantidad: number; precioUnitario: number; totalLinea: number; }
export interface FacturaFELImpresion { codigoFacturaFEL: number; codigoPedido?: number | null; fechaPedido?: string | null; fechaEmision: string; serie?: string | null; numero?: string | null; estado: string; codigoCliente?: number | null; nombreCliente: string; direccionCliente: string; nombreVendedor: string; total: number; detalle: FacturaFELDetalleLinea[]; }
export interface LiquidacionResultado { codigoLiquidacion: number; totalVenta: number; totalRechazado: number; totalGastos: number; totalLiquidado: number; }


export interface DespachoPendienteLiquidacion { codigoDespacho: number; codigoRepartidor: number; nombreRepartidor: string; fechaDespacho: string; estado: string; totalPedidos: number; pedidosEntregados: number; pedidosRechazados: number; pedidosOtros: number; totalEntregado: number; totalRechazado: number }
export interface LiquidacionDespachoPedido { codigoPedido: number; nombreCliente: string; codigoEstadoPedido: number; nombreEstado: string; totalEntregado: number; totalRechazado: number; yaLiquidado: boolean }
export interface LiquidacionDespachoDetalle { codigoDespacho: number; codigoRepartidor: number; nombreRepartidor: string; fechaDespacho: string; estadoDespacho: string; pedidos: LiquidacionDespachoPedido[] }
