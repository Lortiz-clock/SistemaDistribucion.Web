export interface UsuarioLogin {
  nombreUsuario: string
  password: string
}

// Cada módulo que devuelve el login (igualito al ModuloDTO de C#)
export interface Modulo {
  nombre: string
  rutaFront: string
  icono: string
  permiteConsultar: boolean
  permiteAgregar: boolean
  permiteEditar: boolean
  permiteAnular: boolean
}

// La estructura de datos del login
export interface LoginRespuesta {
  token: string
  nombreCompleto: string
  modulos: Modulo[]
}