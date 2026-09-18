import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { ProveedorConsulta } from '../interfaces/ProveedorConsulta'
import type { ProveedorAgregar } from '../interfaces/ProveedorAgregar'

export const consultarProveedor = async () => {
  const respuesta = await api.get<RespuestaApi<ProveedorConsulta[]>>(
    '/api/Proveedor/ConsultarProveedor'
  )
  return respuesta.data
}

export const agregarProveedor = async (proveedor: ProveedorAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Proveedor/AgregarProveedor',
    proveedor
  )
  return respuesta.data
}

export const actualizarProveedor = async (proveedor: ProveedorConsulta) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Proveedor/ActualizarProveedor',
    proveedor
  )
  return respuesta.data
}