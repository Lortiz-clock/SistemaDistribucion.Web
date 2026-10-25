import type { ComprasProveedorResumenConsulta } from './ComprasProveedorResumenConsulta'
import type { CompraOrdenReporteConsulta } from './CompraOrdenReporteConsulta'

export interface ReporteComprasProveedorConsulta {
  resumen: ComprasProveedorResumenConsulta[]
  ordenes: CompraOrdenReporteConsulta[]
}