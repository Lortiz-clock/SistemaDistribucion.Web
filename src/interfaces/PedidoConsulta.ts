export interface PedidoConsulta {
  codigoPedido: number
  codigoCliente: number
  nombreCliente: string
  codigoEmpleado: number
  fechaPedido: string
  fechaVenta: string
  fechaEntregaProgramada?: string | null
  codigoEstadoPedido: number
  nombreEstado: string
  codigoCierre: number | null
  codigoMotivo: number | null
  observaciones: string | null
  totalVenta: number
  utilidad: number
  codigoRepartidor?: number | null
  codigoUsuarioPrepara?: number | null
  codigoUsuarioCarga?: number | null
  codigoUsuarioEntrega?: number | null
  codigoUsuarioLiquida?: number | null
}

export interface PedidoDetalle {
  codigoPedidoDetalle: number
  codigoProducto: number
  codigoProductoBodega: number | null
  cantidad: number
  cantidadEntregada: number | null
  precioVenta: number
  utilidadUnitaria: number
  esFaltante: boolean
  cantidadRechazada: number
  cantidadDevuelta: number
  esContable: boolean
}

export interface PedidoHistorial {
  codigoHistorial: number
  codigoEstadoAnterior: number | null
  codigoEstadoNuevo: number
  fechaCambio: string
  codigoUsuario: number
  codigoMotivo: number | null
}