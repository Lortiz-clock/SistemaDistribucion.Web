import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { RutaConsulta } from '../interfaces/RutaConsulta'
import type { RutaAgregar } from '../interfaces/RutaAgregar'
import type { RutaEditar } from '../interfaces/RutaEditar'

export const consultarRutas = async () => {
  const respuesta = await api.get<RespuestaApi<RutaConsulta[]>>(
    '/api/Rutas/ConsultarRutas'
  )
  return respuesta.data
}

export const agregarRuta = async (ruta: RutaAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Rutas/AgregarRuta',
    ruta
  )
  return respuesta.data
}

export const buscarRuta = async (codigoRuta: number) => {
  const respuesta = await api.get<RespuestaApi<RutaConsulta>>(
    `/api/Rutas/BuscarRuta/${codigoRuta}`
  )
  return respuesta.data
}

export const editarRuta = async (ruta: RutaEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Rutas/EditarRuta',
    ruta
  )
  return respuesta.data
}

export const desactivarRuta = async (codigoRuta: number) => {
  const respuesta = await api.delete<RespuestaApi<boolean>>(
    `/api/Rutas/EliminarRuta/${codigoRuta}`
  )
  return respuesta.data
}
