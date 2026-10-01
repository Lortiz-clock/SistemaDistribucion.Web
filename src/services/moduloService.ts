import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { ModuloConsulta } from '../interfaces/ModuloConsulta'
import type { ModuloAgregar } from '../interfaces/ModuloAgregar'
import type { ModuloEditar } from '../interfaces/ModuloEditar'

export const consultarModulos = async () => {
  const respuesta = await api.get<RespuestaApi<ModuloConsulta[]>>(
    '/api/Modulo/ConsultarModulos'
  )
  return respuesta.data
}

export const agregarModulo = async (modulo: ModuloAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Modulo/AgregarModulo',
    modulo
  )
  return respuesta.data
}

export const editarModulo = async (modulo: ModuloEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Modulo/EditarModulo',
    modulo
  )
  return respuesta.data
}

export const buscarModulo = async (codigoModulo: number) => {
  const respuesta = await api.get<RespuestaApi<ModuloConsulta>>(
    `/api/Modulo/BuscarModulo/${codigoModulo}`
  )
  return respuesta.data
}