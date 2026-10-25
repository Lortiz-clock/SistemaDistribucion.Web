import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { ReporteComprasProveedorConsulta } from '../interfaces/ReporteComprasProveedorConsulta'

export interface FiltroComprasProveedor {
  codigoProveedor?: number
  fechaInicio?: string
  fechaFin?: string
  estado?: string
}

export const consultarComprasPorProveedor = async (
  filtro: FiltroComprasProveedor
) => {
  const respuesta =
    await api.get<RespuestaApi<ReporteComprasProveedorConsulta>>(
      '/api/ReportesCompra/ConsultarComprasPorProveedor',
      { params: filtro }
    )
  return respuesta.data
}