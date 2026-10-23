import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { PuestoConsulta } from '../interfaces/PuestoConsulta'
import type { PuestoAgregar } from '../interfaces/PuestoAgregar'
import type { PuestoEditar } from '../interfaces/PuestoEditar'

export const consultarPuestos = async () => {
  const respuesta = await api.get<RespuestaApi<PuestoConsulta[]>>(
    '/api/Puestos/ConsultarPuestos'
  )
  return respuesta.data
}

export const agregarPuesto = async (puesto: PuestoAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Puestos/AgregarPuesto',
    puesto
  )
  return respuesta.data
}

export const buscarPuesto = async (codigoPuesto: number) => {
  const respuesta = await api.get<RespuestaApi<PuestoConsulta>>(
    `/api/Puestos/BuscarPuesto/${codigoPuesto}`
  )
  return respuesta.data
}

export const editarPuesto = async (puesto: PuestoEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Puestos/EditarPuesto',
    puesto
  )
  return respuesta.data
}

export const desactivarPuesto = async (codigoPuesto: number) => {
  const respuesta = await api.delete<RespuestaApi<boolean>>(
    `/api/Puestos/EliminarPuesto/${codigoPuesto}`
  )
  return respuesta.data
}
