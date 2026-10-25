import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { ClienteRutaConsulta } from '../interfaces/ClienteRutaConsulta'
import type { ClienteRutaAgregar } from '../interfaces/ClienteRutaAgregar'
import type { ClienteRutaEditar } from '../interfaces/ClienteRutaEditar'
import type { ClienteDisponible } from '../interfaces/ClienteDisponible'

export const consultarClientesRuta = async () => {
  const respuesta = await api.get<RespuestaApi<ClienteRutaConsulta[]>>(
    '/api/ClientesRuta/ConsultarClientesRuta'
  )
  return respuesta.data
}

export const agregarClienteRuta = async (clienteRuta: ClienteRutaAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/ClientesRuta/AgregarClienteRuta',
    clienteRuta
  )
  return respuesta.data
}

export const buscarClienteRuta = async (codigoClienteRuta: number) => {
  const respuesta = await api.get<RespuestaApi<ClienteRutaConsulta>>(
    `/api/ClientesRuta/BuscarClienteRuta/${codigoClienteRuta}`
  )
  return respuesta.data
}

export const editarClienteRuta = async (clienteRuta: ClienteRutaEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/ClientesRuta/EditarClienteRuta',
    clienteRuta
  )
  return respuesta.data
}

export const finalizarClienteRuta = async (codigoClienteRuta: number) => {
  const respuesta = await api.delete<RespuestaApi<boolean>>(
    `/api/ClientesRuta/EliminarClienteRuta/${codigoClienteRuta}`
  )
  return respuesta.data
}

export const consultarClientesDisponibles = async () => {
  const respuesta = await api.get<RespuestaApi<ClienteDisponible[]>>(
    '/api/ClientesRuta/ConsultarClientesDisponibles'
  )
  return respuesta.data
}
