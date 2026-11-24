export interface PedidoOperacion {
  codigoPedido: number; codigoCliente: number; nombreCliente: string; direccion: string; referencia: string;
  latitud?: number | null; longitud?: number | null; fechaPedido: string; fechaEntregaProgramada?: string | null;
  codigoEstadoPedido: number; nombreEstado: string; codigoRepartidor?: number | null; totalVenta: number; totalUnidades: number; observaciones: string;
}
export interface ComisionEntrega { codigoComisionEntrega: number; porcentajeMinimo: number; porcentajeMaximo?: number | null; montoPago: number; estado: boolean; }
export interface ReporteVendedor { codigoEmpleado: number; nombreEmpleado: string; ventaTotal: number; utilidadTotal: number; pedidosEntregados: number; totalPedidos: number; porcentajeEntrega: number; comision: number; }
export interface FacturaFEL { codigoFacturaFEL: number; codigoPedido?: number | null; fechaEmision: string; serie?: string | null; numero?: string | null; uuid?: string | null; total: number; estado: string; observaciones?: string | null; totalEnvio: number; totalContable: number; }
export interface LiquidacionResultado { codigoLiquidacion: number; totalVenta: number; totalRechazado: number; totalGastos: number; totalLiquidado: number; }
