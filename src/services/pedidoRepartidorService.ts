import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { PedidoRepartidorConsulta } from '../interfaces/PedidoRepartidorConsulta'

export const consultarAsignacionPedidos = async (
  fechaDesde: string,
  fechaHasta: string,
  codigoEmpleado?: number
) => {
  const params: Record<string, string | number> = { fechaDesde, fechaHasta }
  if (codigoEmpleado && codigoEmpleado > 0) params.codigoEmpleado = codigoEmpleado

  const respuesta = await api.get<RespuestaApi<PedidoRepartidorConsulta[]>>(
    '/api/PedidoRepartidor/ConsultarAsignacion',
    { params }
  )
  return respuesta.data
}

export const asignarPedidosPiloto = async (pedidos: number[], codigoRepartidor: number) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/PedidoRepartidor/AsignarPedidos',
    { pedidos, codigoRepartidor }
  )
  return respuesta.data
}

export const quitarAsignacionPedidos = async (pedidos: number[]) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/PedidoRepartidor/QuitarAsignacion',
    { pedidos }
  )
  return respuesta.data
}
