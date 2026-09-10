import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { UsuarioLogin } from '../interfaces/UsuarioLogin'

export const loginUsuario = async (credenciales: UsuarioLogin) => {
  const respuesta = await api.post<RespuestaApi<string>>(
    '/api/Usuario/login', // 👈 Asegúrate de que esta sea la ruta exacta de tu controlador en C#
    credenciales
  )
  return respuesta.data
}