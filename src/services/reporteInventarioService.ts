import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { InversionInventarioConsulta } from '../interfaces/InversionInventarioConsulta'
import type { ExistenciaConsolidadaConsulta } from '../interfaces/ExistenciaConsolidadaConsulta'

export const consultarInversionInventario = async (codigoBodega?: number) => {
  const respuesta = await api.get<RespuestaApi<InversionInventarioConsulta>>(
    '/api/ReportesInventario/ConsultarInversionInventario',
    { params: { codigoBodega } }
  )
  return respuesta.data
}

export const consultarExistenciasConsolidadas = async (codigoProducto?: number) => {
  const respuesta = await api.get<RespuestaApi<ExistenciaConsolidadaConsulta[]>>(
    '/api/ReportesInventario/ConsultarExistenciasConsolidadas',
    { params: { codigoProducto } }
  )
  return respuesta.data
}
