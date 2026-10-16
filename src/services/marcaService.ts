import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { MarcaConsulta } from '../interfaces/MarcaConsulta'

export const consultarMarcas = async () => {
    const respuesta = 
    await api.get<RespuestaApi<MarcaConsulta[]>>(
        '/api/Marca/ConsultarMarcas'
    )
    return respuesta.data
}