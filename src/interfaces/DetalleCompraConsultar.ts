export interface DetalleCompraConsultar {
  codigoDetalle: number
  codigoCompra: number
  codigoProducto: number
  nombreProducto: string
  cantidadPedida: number
  cantidadRecibida: number
  precioCosto: number
  margenMinimoPct: number
  metaUtilidadPct: number
  precioMinimo: number
  precioSugerido: number
  comentarioRecepcion: string
}