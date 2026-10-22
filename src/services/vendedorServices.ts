import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { VendedorConsulta } from '../interfaces/VendedorConsulta'
import type { VendedorAgregar } from '../interfaces/VendedorAgregar'
import type { VendedorEditar } from '../interfaces/VendedorEditar'

export const consultarVendedores = async () => {
  const respuesta = await api.get<RespuestaApi<VendedorConsulta[]>>(
    '/api/Vendedores/ConsultarVendedores'
  )
  return respuesta.data
}

export const agregarVendedor = async (vendedor: VendedorAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Vendedores/AgregarVendedor',
    vendedor
  )
  return respuesta.data
}

export const buscarVendedor = async (codigoVendedor: number) => {
  const respuesta = await api.get<RespuestaApi<VendedorConsulta>>(
    `/api/Vendedores/BuscarVendedor/${codigoVendedor}`
  )
  return respuesta.data
}

export const editarVendedor = async (vendedor: VendedorEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Vendedores/EditarVendedor',
    vendedor
  )
  return respuesta.data
}

export const desactivarVendedor = async (codigoVendedor: number) => {
  const respuesta = await api.delete<RespuestaApi<boolean>>(
    `/api/Vendedores/EliminarVendedor/${codigoVendedor}`
  )
  return respuesta.data
}
