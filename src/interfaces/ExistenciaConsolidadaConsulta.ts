export interface ExistenciaConsolidadaConsulta {
  codigoProducto: number
  nombre: string
  cantidadTotal: number
  bodegasConExistencia: number
  costoPromedio: number
  valorTotal: number
  vencimientoMasProximo: string | null
}