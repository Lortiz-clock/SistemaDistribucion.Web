import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { InventarioConsultar } from '../interfaces/InventarioConsulta'
import type {
  InventarioLote,
  InventarioHistorial,
  InventarioAjustar
} from '../interfaces/InventarioAjuste'

export const consultarInventario = async () => {
  const respuesta = await api.get<RespuestaApi<InventarioConsultar[]>>(
    '/api/Inventario/ConsultarInventario'
  )
  return respuesta.data
}

export const consultarLotes = async (codigoProducto?: number, codigoBodega?: number) => {
  const respuesta = await api.get<RespuestaApi<InventarioLote[]>>(
    '/api/Inventario/ConsultarLotes',
    { params: { codigoProducto, codigoBodega } }
  )
  return respuesta.data
}

export const ajustarInventario = async (ajuste: InventarioAjustar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Inventario/AjustarInventario',
    ajuste
  )
  return respuesta.data
}

export const consultarHistorial = async (codigoProducto?: number, codigoBodega?: number) => {
  const respuesta = await api.get<RespuestaApi<InventarioHistorial[]>>(
    '/api/Inventario/ConsultarHistorial',
    { params: { codigoProducto, codigoBodega } }
  )
  return respuesta.data
}