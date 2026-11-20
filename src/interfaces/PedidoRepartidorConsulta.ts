export interface PedidoRepartidorConsulta {
  codigoPedido: number
  codigoCliente: number
  nombreCliente: string
  codigoEmpleado: number
  nombreVendedor: string
  fechaPedido: string
  codigoEstadoPedido: number
  nombreEstado: string
  totalVenta: number
  codigoPedidoRepartidor: number | null
  codigoRepartidor: number | null
  nombreRepartidor: string | null
}
