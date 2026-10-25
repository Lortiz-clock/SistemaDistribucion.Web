import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { InversionInventarioConsulta } from '../interfaces/InversionInventarioConsulta'
import type { ExistenciaConsolidadaConsulta } from '../interfaces/ExistenciaConsolidadaConsulta'

export const consultarInversionInventario = async () => {
  const respuesta =
    await api.get<RespuestaApi<InversionInventarioConsulta>>(
      '/api/ReportesInventario/ConsultarInversionInventario'
    )
  return respuesta.data
}

export const consultarExistenciasConsolidadas = async () => {
  const respuesta =
    await api.get<RespuestaApi<ExistenciaConsolidadaConsulta[]>>(
      '/api/ReportesInventario/ConsultarExistenciasConsolidadas'
    )
  return respuesta.data
}