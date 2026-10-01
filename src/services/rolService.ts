import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { RolConsulta, RolDetalle, RolGuardar } from '../interfaces/Rol'

export const consultarRoles = async () => {
  const respuesta = await api.get<RespuestaApi<RolConsulta[]>>(
    '/api/Rol/ConsultarRoles'
  )
  return respuesta.data
}

export const buscarRol = async (codigoRol: number) => {
  const respuesta = await api.get<RespuestaApi<RolDetalle>>(
    `/api/Rol/BuscarRol/${codigoRol}`
  )
  return respuesta.data
}

export const agregarRol = async (rol: RolGuardar) => {
  const respuesta = await api.post<RespuestaApi<number>>(
    '/api/Rol/AgregarRol',
    rol
  )
  return respuesta.data
}

export const editarRol = async (rol: RolGuardar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Rol/EditarRol',
    rol
  )
  return respuesta.data
}