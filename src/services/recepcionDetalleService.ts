import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type {
  RecepcionDetalleConsulta,
  RecepcionDetalleAgregar,
  RecepcionDetalleRespuesta,
  RecepcionResolver,
  RecepcionPendiente
} from '../interfaces/Recepcion'

export const buscarRecepcionDetalle = async (codigoRecepcion: number) => {
  const respuesta = await api.get<RespuestaApi<RecepcionDetalleConsulta[]>>(
    `/api/RecepcionDetalle/BuscarRecepcionDetalle/${codigoRecepcion}`
  )
  return respuesta.data
}

export const agregarDetalleRecepcion = async (detalle: RecepcionDetalleAgregar) => {
  const respuesta = await api.post<RespuestaApi<RecepcionDetalleRespuesta>>(
    '/api/RecepcionDetalle/AgregarDetalleRecepcion',
    detalle
  )
  return respuesta.data
}

export const resolverRecepcionDetalle = async (resolver: RecepcionResolver) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/RecepcionDetalle/ResolverRecepcionDetalle',
    resolver
  )
  return respuesta.data
}

export const buscarPendientesAutorizacion = async () => {
  const respuesta = await api.get<RespuestaApi<RecepcionPendiente[]>>(
    '/api/RecepcionDetalle/PendientesAutorizacion'
  )
  return respuesta.data
}