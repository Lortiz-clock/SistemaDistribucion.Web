export interface ModuloPermiso {
  codigoModulo: number
  nombre: string
  rutaFront: string
  icono: string
  asignado: boolean
  permiteConsultar: boolean
  permiteAgregar: boolean
  permiteEditar: boolean
  permiteAnular: boolean
}

export interface RolDetalle {
  codigoRol: number
  nombre: string
  descripcionRol: string
  estado: boolean
  modulos: ModuloPermiso[]
}

export interface RolModuloItem {
  codigoModulo: number
  permiteConsultar: boolean
  permiteAgregar: boolean
  permiteEditar: boolean
  permiteAnular: boolean
}

export interface RolGuardar {
  codigoRol: number
  nombre: string
  descripcionRol: string
  estado: boolean
  modulos: RolModuloItem[]
}

export interface RolConsulta {
  codigoRol: number
  nombre: string
  descripcionRol: string
  estado: boolean
}