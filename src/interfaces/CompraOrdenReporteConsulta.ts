export interface CompraOrdenReporteConsulta {
  codigoCompra: number
  proveedor: string
  fechaEmision: string
  fechaRecepcionReal: string | null
  estado: string
  totalOrden: number
}