import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { MetaConsulta } from '../interfaces/MetaConsulta'
import type { MetaAgregar } from '../interfaces/MetaConsulta'
import type { MetaEditar } from '../interfaces/MetaConsulta'

export const consultaMeta = async () => {
    const respuesta = await api.get<RespuestaApi<MetaConsulta[]>>(
        '/api/Metas/ConsultarMetas'
    )
    return respuesta.data
}

export const agregarMeta = async (meta: MetaAgregar) => {
    const respuesta = await api.post<RespuestaApi<boolean>>(
        '/api/Metas/AgregarMetas',
        meta
    )
    return respuesta.data
}

export const buscarMeta = async (codigoMeta: number) => {
    const respuesta = await api.get<RespuestaApi<MetaEditar>>(
        `/api/Metas/BuscarMeta/${codigoMeta}`
    )
    return respuesta.data
}

export const editarProducto = async (meta: MetaEditar) => {
    const respuesta = await api.put<RespuestaApi<boolean>>(
        '/api/Metas/EditarMeta',
        meta
    )
    return respuesta.data
}
