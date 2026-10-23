import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { ClientesConsulta } from '../interfaces/ClientesConsulta'
import type { AgregarCliente } from '../interfaces/ClientesAgregar'
import type { EditarCliente } from '../interfaces/ClientesEditar'

export const consultarCliente = async () => {
  const respuesta = await api.get<RespuestaApi<ClientesConsulta[]>>(
    '/api/Cliente/ConsultarClientes'
  )
  return respuesta.data
}

export const agregarCliente = async (cliente: AgregarCliente) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Cliente/AgregarCliente',
    cliente
  )
  return respuesta.data
}

export const buscarCliente = async (codigoCliente: number) => {
  const respuesta = await api.get<RespuestaApi<EditarCliente>>(
    `/api/Cliente/BuscarCliente/${codigoCliente}`
  )
  return respuesta.data
}

export const editarCliente = async (cliente: EditarCliente) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Cliente/EditarCliente',
    cliente
  )
  return respuesta.data
}