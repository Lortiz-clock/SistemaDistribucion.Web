import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { RepartidorConsulta } from '../interfaces/RepartidorConsulta'
import type { RepartidorAgregar } from '../interfaces/RepartidorAgregar'
import type { RepartidorEditar } from '../interfaces/RepartidorEditar'

export const consultarRepartidores = async () => {
  const respuesta = await api.get<RespuestaApi<RepartidorConsulta[]>>(
    '/api/Repartidores/ConsultarRepartidores'
  )
  return respuesta.data
}

export const agregarRepartidor = async (repartidor: RepartidorAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Repartidores/AgregarRepartidor',
    repartidor
  )
  return respuesta.data
}

export const buscarRepartidor = async (codigoRepartidor: number) => {
  const respuesta = await api.get<RespuestaApi<RepartidorConsulta>>(
    `/api/Repartidores/BuscarRepartidor/${codigoRepartidor}`
  )
  return respuesta.data
}

export const editarRepartidor = async (repartidor: RepartidorEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Repartidores/EditarRepartidor',
    repartidor
  )
  return respuesta.data
}

export const desactivarRepartidor = async (codigoRepartidor: number) => {
  const respuesta = await api.delete<RespuestaApi<boolean>>(
    `/api/Repartidores/EliminarRepartidor/${codigoRepartidor}`
  )
  return respuesta.data
}
