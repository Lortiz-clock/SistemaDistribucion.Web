import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { RecepcionConsulta, RecepcionAbrir } from '../interfaces/Recepcion'

export const abrirRecepcion = async (recepcion: RecepcionAbrir) => {
  const respuesta = await api.post<RespuestaApi<number>>(
    '/api/Recepcion/AbrirRecepcion',
    recepcion
  )
  return respuesta.data
}

export const buscarRecepcion = async (codigoRecepcion: number) => {
  const respuesta = await api.get<RespuestaApi<RecepcionConsulta>>(
    `/api/Recepcion/BuscarRecepcion/${codigoRecepcion}`
  )
  return respuesta.data
}

export const cerrarRecepcion = async (codigoRecepcion: number) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    `/api/Recepcion/CerrarRecepcion/${codigoRecepcion}`
  )
  return respuesta.data
}

export const cancelarRecepcion = async (codigoRecepcion: number) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    `/api/Recepcion/CancelarRecepcion/${codigoRecepcion}`
  )
  return respuesta.data
}