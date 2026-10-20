import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { EmpleadoConsulta } from '../interfaces/EmpleadoConsulta'
import type { EmpleadoAgregar } from '../interfaces/EmpleadoAgregar'
import type { EmpleadoEditar } from '../interfaces/EmpleadoEditar'

export const consultarEmpleados = async () => {
  const respuesta = await api.get<RespuestaApi<EmpleadoConsulta[]>>(
    '/api/Empleados/ConsultarEmpleados'
  )
  return respuesta.data
}

export const agregarEmpleado = async (empleado: EmpleadoAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Empleados/AgregarEmpleado',
    empleado
  )
  return respuesta.data
}

export const buscarEmpleado = async (codigoEmpleado: number) => {
  const respuesta = await api.get<RespuestaApi<EmpleadoEditar>>(
    `/api/Empleados/BuscarEmpleado/${codigoEmpleado}`
  )
  return respuesta.data
}

export const editarEmpleado = async (empleado: EmpleadoEditar) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Empleados/EditarEmpleado',
    empleado
  )
  return respuesta.data
}

export const eliminarEmpleado = async (codigoEmpleado: number) => {
  const respuesta = await api.delete<RespuestaApi<boolean>>(
    `/api/Empleados/EliminarEmpleado/${codigoEmpleado}`
  )
  return respuesta.data
}
