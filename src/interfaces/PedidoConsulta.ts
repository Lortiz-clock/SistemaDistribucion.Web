export interface PedidoConsulta {
  codigoPedido: number
  codigoCliente: number
  codigoEmpleado: number
  fechaPedido: string
  codigoEstadoPedido: number
  nombreEstado: string
  codigoCierre: number | null
  codigoMotivo: number | null
  observaciones: string | null
  totalVenta: number
  utilidad: number
}

export interface PedidoDetalle {
  codigoPedidoDetalle: number
  codigoProducto: number
  codigoProductoBodega: number
  cantidad: number
  cantidadEntregada: number | null
  precioVenta: number
  utilidadUnitaria: number
  esFaltante: boolean
}

export interface PedidoHistorial {
  codigoHistorial: number
  codigoEstadoAnterior: number | null
  codigoEstadoNuevo: number
  fechaCambio: string
  codigoUsuario: number
  codigoMotivo: number | null
}