import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { VendedorPuesto } from '../interfaces/VendedorPuesto'
import type { ClienteRutaPlan } from '../interfaces/ClienteRutaPlan'
import type { ClienteDisponible } from '../interfaces/ClienteDisponible'
import type { PeticionAsignarClientes } from '../interfaces/PeticionAsignarClientes'
import type { PeticionReordenarRuta } from '../interfaces/PeticionReordenarRuta'

export const obtenerVendedores = async (nombrePuesto: string) => {
  const respuesta = await api.get<RespuestaApi<VendedorPuesto[]>>(
    `/api/Planificador/EmpleadosPorPuesto/${nombrePuesto}`
  )
  return respuesta.data
}

export const obtenerRuta = async (codigoEmpleado: number, diaSemana: number) => {
  const respuesta = await api.get<RespuestaApi<ClienteRutaPlan[]>>(
    '/api/Planificador/ObtenerRuta',
    { params: { codigoEmpleado, diaSemana } }
  )
  return respuesta.data
}

export const obtenerClientesDisponibles = async (diaSemana: number) => {
  const respuesta = await api.get<RespuestaApi<ClienteDisponible[]>>(
    `/api/Planificador/ClientesDisponibles/${diaSemana}`
  )
  return respuesta.data
}

export const asignarClientes = async (peticion: PeticionAsignarClientes) => {
  const respuesta = await api.post<RespuestaApi<boolean>>('/api/Planificador/AsignarClientes', peticion)
  return respuesta.data
}

export const reordenarRuta = async (peticion: PeticionReordenarRuta) => {
  const respuesta = await api.put<RespuestaApi<boolean>>('/api/Planificador/ReordenarRuta', peticion)
  return respuesta.data
}

export const retirarCliente = async (codigoClienteRuta: number) => {
  const respuesta = await api.delete<RespuestaApi<boolean>>(`/api/Planificador/RetirarCliente/${codigoClienteRuta}`)
  return respuesta.data
}