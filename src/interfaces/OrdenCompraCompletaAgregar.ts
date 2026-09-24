export interface DetalleCompraItem {
  codigoProducto: number
  cantidadPedida: number
  precioCosto: number
  margenMinimoPct: number
  metaUtilidadPct: number
}

export interface OrdenCompraCompletaAgregar {
  codigoProveedor: number
  fechaResep: string
  detalles: DetalleCompraItem[]
}