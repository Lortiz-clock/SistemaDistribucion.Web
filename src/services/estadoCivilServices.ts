import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { EstadoCivilConsulta } from '../interfaces/EstadoCivilConsulta'

export const consultarEstadosCiviles = async () => {
  const respuesta = await api.get<RespuestaApi<EstadoCivilConsulta[]>>(
    '/api/EstadosCiviles/ConsultarEstadosCiviles'
  )
  return respuesta.data
}
