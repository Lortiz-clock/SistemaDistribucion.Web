import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { UsuarioConsulta } from '../interfaces/UsuarioConsulta'
import type {UsuarioAgregar} from '../interfaces/UsuarioAgregar'

export const consultarUsuario = async () => {
  const respuesta =
    await api.get<RespuestaApi<UsuarioConsulta[]>>(
      '/api/Usuario/ConsultarUsuario'
    )

  return respuesta.data
}

export const agregarUsuario = async (
  usuario: UsuarioAgregar

) => {
  const respuesta = 
  await api.post<RespuestaApi<boolean>>(
    '/api/Usuario/AgregarEsuario',
    usuario
  )
  return respuesta.data
}
