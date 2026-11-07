export interface PedidoLineaAgregar {
  codigoProducto: number
  cantidad: number
  precioVenta: number
}

export interface PedidoAgregar {
  codigoCliente: number
  observaciones?: string
  lineas: PedidoLineaAgregar[]
}

export interface PedidoFaltante {
  codigoProducto: number
  nombre: string
  faltante: number
}

export interface PedidoAgregarRespuesta {
  codigoPedido: number
  faltantes: PedidoFaltante[]
}