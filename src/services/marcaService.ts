import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { MarcaConsulta } from '../interfaces/MarcaConsulta'
import type { MarcaAgregar } from '../interfaces/MarcaAgregar'
import type { MarcaEditar } from '../interfaces/MarcaEditar'

export const consultarMarcas = async () => {
    const respuesta = 
    await api.get<RespuestaApi<MarcaConsulta[]>>(
        '/api/Marca/ConsultarMarcas'
    )
    return respuesta.data
}

export const agregarMarca = async (marca: MarcaAgregar) => {
    const respuesta = await api.post<RespuestaApi<boolean>>(
        '/api/Marca/AgregarMarca',
        marca
    )
    return respuesta.data
}

export const editarMarca = async (marca: MarcaEditar) => {
    const respuesta = await api.put<RespuestaApi<boolean>> (
        '/api/Marca/EditarMarca',
        marca
    )
    return respuesta.data
}

export const buscarMarca = async (codigoMarca: number) => {
    const respuesta = await api.get<RespuestaApi<MarcaConsulta>>(
        `/api/Marca/BuscarMarca/${codigoMarca}`
    )
    return respuesta.data
}