import api from './api'
import type { UsuarioLogin, LoginRespuesta } from '../interfaces/UsuarioLogin'
import type { RespuestaApi } from '../interfaces/RespuestaApi'

export async function loginUsuario(credenciales: UsuarioLogin): Promise<RespuestaApi<LoginRespuesta>> {
  const respuesta = await api.post<RespuestaApi<LoginRespuesta>>('/api/Usuario/login', credenciales)
  return respuesta.data
}

export function obtenerNombreUsuario(): string {
  return localStorage.getItem('nombreUsuario') ?? 'Usuario'
}