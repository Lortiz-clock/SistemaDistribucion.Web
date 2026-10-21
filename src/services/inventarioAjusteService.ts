import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type {
  InventarioLote,
  InventarioHistorial,
  InventarioAjustar
} from '../interfaces/InventarioAjuste'

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