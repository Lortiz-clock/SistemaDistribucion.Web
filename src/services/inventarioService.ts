import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'

import type { InventarioConsultar } from '../interfaces/InventarioCondulta'

export const consultarInventario = async () => {
    const Respuesta =
    await api.get<RespuestaApi<InventarioConsultar[]>>(
        '/api/Inventario/ConsultarInventario'
    )
    return Respuesta.data
}