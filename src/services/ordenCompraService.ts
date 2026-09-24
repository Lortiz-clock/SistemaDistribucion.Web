import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { OrdenCompraAgregar } from '../interfaces/OrdenCompraAgregar'
import type { DetalleCompraAgregar } from '../interfaces/DetalleCompraAgregar'
import type { OrdenCompraCompletaAgregar } from '../interfaces/OrdenCompraCompletaAgregar'
import type { OrdenCompraConsultar } from '../interfaces/OrdenCompraConsultar'
import type { DetalleCompraConsultar } from '../interfaces/DetalleCompraConsultar'

export const agregarOrdenCompleta = async (orden: OrdenCompraCompletaAgregar) => {
  const respuesta = await api.post<RespuestaApi<number>>(
    '/api/Compra/AgregarOrdenCompleta',
    orden
  )
  return respuesta.data
}

export const consultarOrdenesCompra = async () => {
  const respuesta = await api.get<RespuestaApi<OrdenCompraConsultar[]>>(
    '/api/Compra/ConsultarOrdenCompra'
  )
  return respuesta.data
}

export const buscarDetalleCompra = async (codigoCompra: number) => {
  const respuesta = await api.get<RespuestaApi<DetalleCompraConsultar[]>>(
    `/api/DetalleCompra/BuscarDetalleCompra/${codigoCompra}`
  )
  return respuesta.data
}

// Endpoints antiguos (ya no se usan en la pantalla de nueva orden)
export const agregarOrdenCompra = async (orden: OrdenCompraAgregar) => {
  const respuesta = await api.post<RespuestaApi<any>>('/api/Compra/AgregarOrdenCompra', orden)
  return respuesta.data
}

export const agregarDetalleCompra = async (detalle: DetalleCompraAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>('/api/DetalleCompra/AgregarDetalleCompra', detalle)
  return respuesta.data
}