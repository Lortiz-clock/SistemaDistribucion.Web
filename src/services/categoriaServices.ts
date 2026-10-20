import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { CategoriaConsulta } from '../interfaces/CategoriaConsulta'
import type { CategoriaAgregar } from '../interfaces/CategoriaAgregar'
import type { CategoriaEditar } from '../interfaces/CategoriaEditar'

export const consultarCategorias = async () => {
  const respuesta = await api.get<RespuestaApi<CategoriaConsulta[]>>(
    '/api/Categorias/ConsultarCategorias'
  )
  return respuesta.data
}

export const agregarCategoria = async (categoria: CategoriaAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Categorias/AgregarCategoria',
    categoria
  )
  return respuesta.data
}

export const buscarCategoria = async (codigoCategoria: number) => {
  const respuesta = await api.get<RespuestaApi<CategoriaEditar>>(
    `/api/Categorias/BuscarCategoria/${codigoCategoria}`
  )
  return respuesta.data
}

export const editarCategoria = async (categoria: CategoriaEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Categorias/EditarCategoria',
    categoria
  )
  return respuesta.data
}

export const eliminarCategoria = async (codigoCategoria: number) => {
  const respuesta = await api.delete<RespuestaApi<boolean>>(
    `/api/Categorias/EliminarCategoria/${codigoCategoria}`
  )
  return respuesta.data
}
// Nombre que ya usaba AgregarProductoPage (se conserva para no romperlo)
export const consultaCategoria = consultarCategorias