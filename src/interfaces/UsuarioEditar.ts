export interface UsuarioEditar {
  codigoUsuario: number
  codigoEmpleado: number
  codigoRol: number
  nombreUsuario: string
  passwordHash?: string | null
  estado: boolean
}