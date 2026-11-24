import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { BodegaConsulta } from '../interfaces/Bodega'

export const consultarBodegas = async () => {
  const respuesta = await api.get<RespuestaApi<BodegaConsulta[]>>('/api/Bodega/ConsultarBodega')
  return respuesta.data
}
