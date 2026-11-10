import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { PedidoConsulta } from '../interfaces/PedidoConsulta'
import type { PedidoBuscar } from '../interfaces/PedidoBuscar'
import type { PedidoAgregar, PedidoAgregarRespuesta } from '../interfaces/PedidoAgregar'
import type { ProductoConStock } from '../interfaces/ProductoConStock'
import type { SemaforoUtilidad } from '../interfaces/SemaforoUtilidad'
import type { ClienteRutaPlan } from '../interfaces/ClienteRutaPlan'

// ─── Consultar pedidos por rango de fechas ───
export const consultarPedidos = async (
  fechaDesde: string,
  fechaHasta: string,
  codigoEmpleado?: number,
  codigoEstadoPedido?: number
) => {
  const respuesta = await api.get<RespuestaApi<PedidoConsulta[]>>(
    '/api/Pedidos/ConsultarPedidos',
    { params: { fechaDesde, fechaHasta, codigoEmpleado, codigoEstadoPedido } }
  )
  return respuesta.data
}

// ─── Buscar un pedido completo (encabezado + detalle + historial) ───
export const buscarPedido = async (codigoPedido: number) => {
  const respuesta = await api.get<RespuestaApi<PedidoBuscar>>(
    `/api/Pedidos/BuscarPedido/${codigoPedido}`
  )
  return respuesta.data
}

// ─── Agregar pedido ───
export const agregarPedido = async (pedido: PedidoAgregar) => {
  const respuesta = await api.post<RespuestaApi<PedidoAgregarRespuesta>>(
    '/api/Pedidos/AgregarPedido',
    pedido
  )
  return respuesta.data
}

// ─── Mis clientes del día (del token, no del parámetro) ───
export const obtenerMisClientesDelDia = async (diaSemana: number) => {
  const respuesta = await api.get<RespuestaApi<ClienteRutaPlan[]>>(
    '/api/Pedidos/MisClientesDelDia',
    { params: { diaSemana } }
  )
  return respuesta.data
}

// ─── Productos con stock para el modal de crear pedido ───
export const obtenerProductosConStock = async () => {
  const respuesta = await api.get<RespuestaApi<ProductoConStock[]>>(
    '/api/Pedidos/ProductosConStock'
  )
  return respuesta.data
}

// ─── Semáforo de utilidad del vendedor ───
export const obtenerSemaforoUtilidad = async (fechaDesde: string, fechaHasta: string) => {
  const respuesta = await api.get<RespuestaApi<SemaforoUtilidad>>(
    '/api/Pedidos/SemaforoUtilidad',
    { params: { fechaDesde, fechaHasta } }
  )
  return respuesta.data
}

export async function registrarNoVisita(payload: {
  codigoCliente: number
  codigoMotivo: number
  observaciones?: string
}) {
  const respuesta = await api.post<RespuestaApi<number>>(
    '/api/Pedidos/RegistrarNoVisita',
    payload
  )
  return respuesta.data
}

import type { ResumenVendedor } from '../interfaces/ResumenVendedor'

export const obtenerResumenVendedor = async (fechaDesde: string, fechaHasta: string) => {
  const respuesta = await api.get<RespuestaApi<ResumenVendedor>>(
    '/api/Pedidos/ResumenVendedor',
    { params: { fechaDesde, fechaHasta } }
  )
  return respuesta.data
}