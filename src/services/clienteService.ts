import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { ClientesConsulta } from '../interfaces/ClientesConsulta'
import type { AgregarCliente } from '../interfaces/ClientesAgregar'

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