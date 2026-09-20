import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { UsuarioLogin } from '../interfaces/UsuarioLogin'

export const loginUsuario = async (credenciales: UsuarioLogin) => {
  const respuesta = await api.post<RespuestaApi<string>>(
    '/api/Usuario/login', 
    credenciales
  )
  return respuesta.data

}

export function obtenerNombreUsuario(): string | null {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json).NombreCompleto ?? null
  } catch {
    return null
  }
}