import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { CategoriaConsulta } from '../interfaces/CategoriaConsulta'

export const consultaCategoria = async () => {
    const respuesta = 
    await api.get<RespuestaApi<CategoriaConsulta[]>>(
    '/api/Categorias/ConsultarCategorias'
    )

 return respuesta.data   
}