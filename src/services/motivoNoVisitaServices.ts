import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { MotivoNoVisitaConsulta } from '../interfaces/MotivoNoVisitaConsulta'
import type { MotivoNoVisitaAgregar } from '../interfaces/MotivoNoVisitaAgregar'
import type { MotivoNoVisitaEditar } from '../interfaces/MotivoNoVisitaEditar'

export const consultarMotivosNoVisita = async () => {
  const respuesta = await api.get<RespuestaApi<MotivoNoVisitaConsulta[]>>(
    '/api/MotivosNoVisita/ConsultarMotivosNoVisita'
  )
  return respuesta.data
}

export const agregarMotivoNoVisita = async (motivoNoVisita: MotivoNoVisitaAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/MotivosNoVisita/AgregarMotivoNoVisita',
    motivoNoVisita
  )
  return respuesta.data
}

export const buscarMotivoNoVisita = async (codigoMotivo: number) => {
  const respuesta = await api.get<RespuestaApi<MotivoNoVisitaConsulta>>(
    `/api/MotivosNoVisita/BuscarMotivoNoVisita/${codigoMotivo}`
  )
  return respuesta.data
}

export const editarMotivoNoVisita = async (motivoNoVisita: MotivoNoVisitaEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/MotivosNoVisita/EditarMotivoNoVisita',
    motivoNoVisita
  )
  return respuesta.data
}

export const desactivarMotivoNoVisita = async (codigoMotivo: number) => {
  const respuesta = await api.delete<RespuestaApi<boolean>>(
    `/api/MotivosNoVisita/EliminarMotivoNoVisita/${codigoMotivo}`
  )
  return respuesta.data
}
