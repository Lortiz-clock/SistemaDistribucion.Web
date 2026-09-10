import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { UsuarioConsulta } from '../interfaces/UsuarioConsulta'

export const consultarUsuario = async () => {
  const respuesta =
    await api.get<RespuestaApi<UsuarioConsulta[]>>(
      '/api/Usuario/ConsultarUsuario'
    )

  return respuesta.data
}
