import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { UsuarioConsulta } from '../interfaces/UsuarioConsulta'
import type {UsuarioAgregar} from '../interfaces/UsuarioAgregar'
import type { BuscarUsuario } from '../interfaces/BuscarUsuario'

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
    '/api/Usuario/AgregarUsuario',
    usuario
  )
  return respuesta.data
}

export const buscarUsuario = async (codigoUsuario: number) => {
  const respuesta = await api.get<RespuestaApi<BuscarUsuario>>(
    `/api/Usuario/BuscarUsuario/${codigoUsuario}`
  )
  return respuesta.data
}

import type { UsuarioEditar } from '../interfaces/UsuarioEditar'

export const editarUsuario = async (usuario: UsuarioEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Usuario/EditarUsuario',
    usuario
  )
  return respuesta.data
}