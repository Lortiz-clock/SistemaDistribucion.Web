export interface EditarCliente {
  codigoCliente: number
  nombre: string
  nit: string
  direccion: string
  referencia: string
  latitud: number | null
  longitud: number | null
  estado: boolean
}