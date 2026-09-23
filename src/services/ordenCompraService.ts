import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { OrdenCompraAgregar } from '../interfaces/OrdenCompraAgregar'
import type { DetalleCompraAgregar } from '../interfaces/DetalleCompraAgregar'

// 1. Servicio para crear el encabezado de la orden
export const agregarOrdenCompra = async (orden: OrdenCompraAgregar) => {
  const respuesta = await api.post<RespuestaApi<any>>(
    '/api/Compra/AgregarOrdenCompra',
    orden
  )
  return respuesta.data
}

// 2. Servicio para agregar un producto al detalle
export const agregarDetalleCompra = async (detalle: DetalleCompraAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/DetalleCompra/AgregarDetalleCompra', 
    detalle
  )
  return respuesta.data
}