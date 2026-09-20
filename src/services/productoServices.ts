import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { ProductoConsulta } from '../interfaces/ProductoConsulta'
import type { ProductoAgregar } from '../interfaces/ProductoAgregar'
import type { ProductoEditar } from '../interfaces/ProductoEditar'

export const consultarProducto = async () => {
  const respuesta = await api.get<RespuestaApi<ProductoConsulta[]>>(
    '/api/Producto/ConsultarProducto'
  )
  return respuesta.data
}

export const agregarProducto = async (producto: ProductoAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Producto/AgregarProducto',
    producto
  )
  return respuesta.data
}

export const buscarProducto = async (codigoProducto: number) => {
  const respuesta = await api.get<RespuestaApi<ProductoEditar>>(
    `/api/Producto/BuscarProducto/${codigoProducto}`
  )
  return respuesta.data
}

export const editarProducto = async (producto: ProductoEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Producto/EditarProducto',
    producto
  )
  return respuesta.data
}