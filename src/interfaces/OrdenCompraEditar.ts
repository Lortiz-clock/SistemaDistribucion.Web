// El encabezado de la orden (lo que devuelve BuscarOrdenCompra)
export interface OrdenEncabezado {
  codigoCompra: number
  codigoProveedor: number
  fechaEmision: string
  fechaResep: string
  estado: string
}

// Una línea del detalle, tal como la devuelve BuscarDetalleCompra
export interface DetalleExistente {
  codigoDetalle: number
  codigoCompra: number
  codigoProducto: number
  nombreProducto: string
  cantidadPedida: number
  precioCosto: number
  margenMinimoPct: number
  metaUtilidadPct: number
  precioMinimo: number
  precioSugerido: number
  comentarioRecepcion: string
}

// Lo que envía el Agregar (línea nueva)
export interface DetalleAgregar {
  codigoCompra: number
  codigoProducto: number
  cantidadPedida: number
  precioCosto: number
  margenMinimoPct: number
  metaUtilidadPct: number
}

// Lo que envía el Editar
export interface DetalleEditar {
  codigoDetalle: number
  codigoProducto: number
  cantidadPedida: number
  precioCosto: number
  margenMinimoPct: number
  metaUtilidadPct: number
}