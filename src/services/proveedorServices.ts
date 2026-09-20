import api from './api'

import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { ProveedorConsulta } from '../interfaces/ProveedorConsulta'
import type { ProveedorAgregar } from '../interfaces/ProveedorAgregar'
import type { EditarProveedor } from '../interfaces/ProveedorEditar'

export const consultarProveedor = async () => {
  const respuesta = await api.get<RespuestaApi<ProveedorConsulta[]>>(
    '/api/Proveedores/ConsultarProveedor'
  )
  return respuesta.data
}

export const agregarProveedor = async (proveedor: ProveedorAgregar) => {
  const respuesta = await api.post<RespuestaApi<boolean>>(
    '/api/Proveedores/AgregarProveedor',
    proveedor
  )
  return respuesta.data
}

export const buscarProveedor = async (codigoProveedor: number) => {
  const respuesta = await api.get<RespuestaApi<EditarProveedor>>(
    `/api/Proveedores/BuscarProveedores/${codigoProveedor}`
  )
  return respuesta.data
}

export const editarProveedor = async (proveedor: EditarProveedor) => {
  const respuesta = await api.put<RespuestaApi<boolean>>(
    '/api/Proveedores/EditarProveedores',
    proveedor
  )
  return respuesta.data
}